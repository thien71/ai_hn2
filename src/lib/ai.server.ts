// Server-only helpers: Lovable AI Gateway calls + RAG logic.
const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const EMBED_MODEL = "openai/text-embedding-3-small";
const CHAT_MODEL = "google/gemini-3.6-flash";

function apiKey() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Thiếu LOVABLE_API_KEY");
  return key;
}

async function gateway(path: string, body: unknown) {
  const res = await fetch(`${GATEWAY}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Hệ thống AI đang quá tải, vui lòng thử lại sau ít phút.");
    if (res.status === 402) throw new Error("Đã hết hạn mức sử dụng AI. Vui lòng nạp thêm tín dụng.");
    throw new Error(`Lỗi AI (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function embedTexts(inputs: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < inputs.length; i += 64) {
    const batch = inputs.slice(i, i + 64);
    const json = (await gateway("/embeddings", { model: EMBED_MODEL, input: batch })) as {
      data: { index: number; embedding: number[] }[];
    };
    const sorted = [...json.data].sort((a, b) => a.index - b.index);
    out.push(...sorted.map((d) => d.embedding));
  }
  return out;
}

/** Cắt văn bản thành các đoạn ~1200 ký tự, ưu tiên ranh giới đoạn văn. */
export function chunkText(text: string, size = 1200, overlap = 150): string[] {
  const clean = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!clean) return [];
  const paragraphs = clean.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = "";

  const push = () => {
    const t = current.trim();
    if (t) chunks.push(t);
    current = "";
  };

  for (const p of paragraphs) {
    if (p.length > size) {
      push();
      for (let i = 0; i < p.length; i += size - overlap) {
        chunks.push(p.slice(i, i + size).trim());
      }
      continue;
    }
    if ((current + "\n\n" + p).length > size) push();
    current = current ? `${current}\n\n${p}` : p;
  }
  push();
  return chunks.filter(Boolean);
}

export type Source = { title: string; snippet: string };

export async function answerQuestion(
  question: string,
  history: { role: "user" | "assistant"; content: string }[],
  passages: { title: string; content: string }[],
): Promise<string> {
  const context = passages
    .map((p, i) => `[Nguồn ${i + 1} — ${p.title}]\n${p.content}`)
    .join("\n\n---\n\n");

  const system = `Bạn là trợ lý AI của chi bộ trường tiểu học, hỗ trợ tra cứu văn bản, nghị quyết, kế hoạch và báo cáo của chi bộ.

QUY TẮC:
- Chỉ trả lời dựa trên phần "TÀI LIỆU THAM KHẢO" bên dưới. Tuyệt đối không suy đoán hay bịa đặt.
- Nếu tài liệu không có thông tin, hãy nói rõ: "Tôi không tìm thấy nội dung này trong kho tài liệu của chi bộ."
- Trích dẫn tên tài liệu khi trả lời, ví dụ: (theo Nghị quyết tháng 9).
- Trả lời bằng tiếng Việt, văn phong hành chính, ngắn gọn, rõ ý, dùng gạch đầu dòng khi liệt kê.

TÀI LIỆU THAM KHẢO:
${context || "(Kho tài liệu đang trống)"}`;

  const json = (await gateway("/chat/completions", {
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: system },
      ...history.slice(-10),
      { role: "user", content: question },
    ],
  })) as { choices: { message: { content: string } }[] };

  return json.choices?.[0]?.message?.content?.trim() || "Xin lỗi, tôi chưa tạo được câu trả lời.";
}
