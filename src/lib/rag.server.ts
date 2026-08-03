import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { answerQuestion, chunkPages, embedTexts, type Passage, type Source } from "./ai.server";

export type DocumentRow = {
  id: string;
  title: string;
  file_name: string | null;
  file_type: string | null;
  needs_ocr: boolean;
  page_count: number | null;
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

export type AddDocumentInput = {
  title: string;
  pages: string[];
  fileName?: string | null;
  fileType?: string | null;
  contentHash?: string | null;
  needsOcr?: boolean;
};

export async function listDocumentsImpl(): Promise<DocumentRow[]> {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select(
      "id, title, content, file_name, file_type, needs_ocr, page_count, created_at, document_chunks(count)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    file_name: d.file_name ?? null,
    file_type: d.file_type ?? null,
    needs_ocr: Boolean(d.needs_ocr),
    page_count: d.page_count ?? null,
    created_at: d.created_at,
    chars: (d.content as string).length,
    chunks:
      (d as unknown as { document_chunks: { count: number }[] }).document_chunks?.[0]?.count ?? 0,
  }));
}

/** Cache embedding: file có cùng mã nội dung thì không xử lý lại. */
export async function findByHashImpl(contentHash: string) {
  const { data } = await supabaseAdmin
    .from("documents")
    .select("id, title")
    .eq("content_hash", contentHash)
    .maybeSingle();
  return data ? { exists: true as const, id: data.id, title: data.title } : { exists: false as const };
}

export async function addDocumentImpl(input: AddDocumentInput) {
  const title = input.title.trim();
  const pages = input.pages.map((p) => p ?? "");
  const content = pages.join("\n\n").trim();

  if (input.contentHash) {
    const found = await findByHashImpl(input.contentHash);
    if (found.exists) return { id: found.id, chunks: 0, skipped: true as const };
  }

  const chunks = chunkPages(pages);
  if (chunks.length === 0) throw new Error("Tài liệu không có nội dung văn bản để lập chỉ mục.");

  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .insert({
      title,
      content,
      file_name: input.fileName ?? title,
      file_type: input.fileType ?? null,
      content_hash: input.contentHash ?? null,
      page_count: pages.length > 1 ? pages.length : null,
      needs_ocr: input.needsOcr ?? false,
    })
    .select("id")
    .single();
  if (error || !doc) throw new Error(error?.message ?? "Không lưu được tài liệu.");

  try {
    const embeddings = await embedTexts(chunks.map((c) => c.content));
    const rows = chunks.map((c, i) => ({
      document_id: doc.id,
      chunk_index: i,
      content: c.content,
      heading: c.heading,
      page_from: c.pageFrom,
      page_to: c.pageTo,
      word_count: c.wordCount,
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

  return { id: doc.id, chunks: chunks.length, skipped: false as const };
}

export async function seedSampleDocumentsImpl() {
  const { SEED_DOCS } = await import("./seed-docs");
  const { data: existing } = await supabaseAdmin.from("documents").select("title");
  const titles = new Set((existing ?? []).map((d) => d.title as string));
  let added = 0;
  for (const doc of SEED_DOCS) {
    if (titles.has(doc.title)) continue;
    await addDocumentImpl({
      title: doc.title,
      pages: [doc.content],
      fileName: `${doc.title}.txt`,
      fileType: "txt",
    });
    added += 1;
  }
  return { added, skipped: SEED_DOCS.length - added };
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
  const { error } = await supabaseAdmin.from("messages").delete().not("id", "is", null);
  if (error) throw new Error(error.message);
  return { ok: true };
}

function pageLabel(from: number | null, to: number | null) {
  if (from == null) return null;
  return from === to || to == null ? `${from}` : `${from}–${to}`;
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
      match_count: 10,
    });
    if (matchError) throw new Error(matchError.message);

    const all = (matches ?? []) as (Passage & { similarity: number })[];
    // chỉ đưa 5–10 đoạn liên quan nhất vào prompt
    const relevant = all.filter((p) => p.similarity > 0.15).slice(0, 10);
    const passages: Passage[] = relevant.length > 0 ? relevant : all.slice(0, 5);

    answer = await answerQuestion(
      question,
      history.map((m) => ({ role: m.role, content: m.content })),
      relevant.length > 0 ? passages : [],
    );

    const seen = new Set<string>();
    sources = relevant
      .filter((p) => {
        const key = `${p.file_name}#${p.page_from ?? ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 5)
      .map((p) => ({
        title: p.title,
        file: p.file_name,
        page: pageLabel(p.page_from, p.page_to),
        heading: p.heading ?? null,
        snippet: p.content.replace(/\s+/g, " ").slice(0, 320),
      }));
  } catch (e) {
    answer = `Không thể tạo câu trả lời: ${e instanceof Error ? e.message : "lỗi không xác định"}`;
  }

  const { error: aiError } = await supabaseAdmin
    .from("messages")
    .insert({ role: "assistant", content: answer, sources });
  if (aiError) throw new Error(aiError.message);

  return getMessagesImpl();
}
