import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { answerQuestion, chunkText, embedTexts, type Source } from "./ai.server";

export type DocumentRow = {
  id: string;
  title: string;
  created_at: string;
  chars: number;
  chunks: number;
};

export type MessageRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: Source[];
  created_at: string;
};

export async function listDocumentsImpl(): Promise<DocumentRow[]> {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("id, title, content, created_at, document_chunks(count)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    created_at: d.created_at,
    chars: (d.content as string).length,
    chunks:
      (d as unknown as { document_chunks: { count: number }[] }).document_chunks?.[0]?.count ?? 0,
  }));
}

export async function addDocumentImpl(title: string, content: string) {
  const chunks = chunkText(content);
  if (chunks.length === 0) throw new Error("Tài liệu không có nội dung.");

  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .insert({ title, content })
    .select("id")
    .single();
  if (error || !doc) throw new Error(error?.message ?? "Không lưu được tài liệu.");

  try {
    const embeddings = await embedTexts(chunks);
    const rows = chunks.map((c, i) => ({
      document_id: doc.id,
      chunk_index: i,
      content: c,
      embedding: JSON.stringify(embeddings[i]),
    }));
    for (let i = 0; i < rows.length; i += 100) {
      const { error: chunkError } = await supabaseAdmin
        .from("document_chunks")
        .insert(rows.slice(i, i + 100));
      if (chunkError) throw new Error(chunkError.message);
    }
  } catch (e) {
    await supabaseAdmin.from("documents").delete().eq("id", doc.id);
    throw e;
  }

  return { id: doc.id, chunks: chunks.length };
}

export async function deleteDocumentImpl(id: string) {
  const { error } = await supabaseAdmin.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function getMessagesImpl(): Promise<MessageRow[]> {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("id, role, content, sources, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MessageRow[];
}

export async function clearMessagesImpl() {
  const { error } = await supabaseAdmin
    .from("messages")
    .delete()
    .not("id", "is", null);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function askImpl(question: string): Promise<MessageRow[]> {
  const history = await getMessagesImpl();

  const { error: userError } = await supabaseAdmin
    .from("messages")
    .insert({ role: "user", content: question });
  if (userError) throw new Error(userError.message);

  let answer: string;
  let sources: Source[] = [];
  try {
    const [queryEmbedding] = await embedTexts([question]);
    const { data: matches, error: matchError } = await supabaseAdmin.rpc("match_chunks", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: 6,
    });
    if (matchError) throw new Error(matchError.message);

    const passages = (matches ?? []) as {
      title: string;
      content: string;
      similarity: number;
    }[];
    const relevant = passages.filter((p) => p.similarity > 0.15);

    answer = await answerQuestion(
      question,
      history.map((m) => ({ role: m.role, content: m.content })),
      relevant,
    );

    const seen = new Set<string>();
    sources = relevant
      .filter((p) => (seen.has(p.title) ? false : (seen.add(p.title), true)))
      .slice(0, 4)
      .map((p) => ({ title: p.title, snippet: p.content.slice(0, 220) }));
  } catch (e) {
    answer = `Không thể tạo câu trả lời: ${e instanceof Error ? e.message : "lỗi không xác định"}`;
  }

  const { error: aiError } = await supabaseAdmin
    .from("messages")
    .insert({ role: "assistant", content: answer, sources });
  if (aiError) throw new Error(aiError.message);

  return getMessagesImpl();
}
