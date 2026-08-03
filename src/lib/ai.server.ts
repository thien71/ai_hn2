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

export type Chunk = {
  content: string;
  wordCount: number;
  pageFrom: number | null;
  pageTo: number | null;
  heading: string | null;
};

const HEADING_RE =
  /^\s*(?:(?:CHƯƠNG|PHẦN|MỤC|ĐIỀU|Chương|Phần|Mục|Điều)\s+[IVXLC\d]+|[IVXLC]+\.|\d+(?:\.\d+)*[.)]|[A-ZĐ][^a-z\n]{6,})/;

function detectHeading(text: string): string | null {
  for (const line of text.split("\n").slice(0, 6)) {
    const t = line.trim();
    if (t.length >= 4 && t.length <= 160 && HEADING_RE.test(t)) return t;
  }
  return null;
}

/**
 * Cắt tài liệu thành các đoạn 500–800 từ, chồng lấp ~100 từ,
 * giữ nguyên số trang (nếu nguồn là PDF nhiều trang).
 */
export function chunkPages(
  pages: string[],
  { target = 700, max = 800, overlap = 100 } = {},
): Chunk[] {
  type Word = { w: string; page: number };
  const words: Word[] = [];
  pages.forEach((raw, idx) => {
    const clean = (raw ?? "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
    if (!clean) return;
    for (const w of clean.split(/(\s+)/)) {
      if (w.trim() === "" && !w.includes("\n")) continue;
      words.push({ w: w.includes("\n") ? "\n" : w, page: idx + 1 });
    }
  });

  const real = words.filter((x) => x.w !== "\n");
  if (real.length === 0) return [];

  const chunks: Chunk[] = [];
  let i = 0;
  const step = Math.max(1, target - overlap);

  while (i < words.length) {
    let end = i;
    let count = 0;
    while (end < words.length && count < max) {
      if (words[end].w !== "\n") count += 1;
      end += 1;
      if (count >= target) break;
    }
    const slice = words.slice(i, end);
    const content = slice
      .map((x) => x.w)
      .join(" ")
      .replace(/\s*\n\s*/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    const wordCount = slice.filter((x) => x.w !== "\n").length;
    if (wordCount >= 20) {
      const pageNums = slice.map((x) => x.page);
      chunks.push({
        content,
        wordCount,
        pageFrom: pages.length > 1 ? Math.min(...pageNums) : null,
        pageTo: pages.length > 1 ? Math.max(...pageNums) : null,
        heading: detectHeading(content),
      });
    } else if (chunks.length === 0 && content) {
      chunks.push({
        content,
        wordCount,
        pageFrom: pages.length > 1 ? slice[0]?.page ?? null : null,
        pageTo: pages.length > 1 ? slice[slice.length - 1]?.page ?? null : null,
        heading: detectHeading(content),
      });
    }

    if (end >= words.length) break;
    // lùi lại ~overlap từ thật để tạo phần chồng lấp
    let back = 0;
    let j = end;
    while (j > i && back < overlap) {
      j -= 1;
      if (words[j].w !== "\n") back += 1;
    }
    i = Math.max(i + step, j) === i ? i + step : Math.max(j, i + 1);
  }

  return chunks;
}

export type Source = {
  title: string;
  file: string;
  page: string | null;
  heading: string | null;
  snippet: string;
};

export type Passage = {
  title: string;
  file_name: string;
  heading: string | null;
  page_from: number | null;
  page_to: number | null;
  content: string;
};

export async function answerQuestion(
  question: string,
  history: { role: "user" | "assistant"; content: string }[],
  passages: Passage[],
): Promise<string> {
  const context = passages
    .map((p, i) => {
      const page =
        p.page_from == null
          ? ""
          : p.page_from === p.page_to
            ? `, trang ${p.page_from}`
            : `, trang ${p.page_from}–${p.page_to}`;
      const heading = p.heading ? `, mục: ${p.heading}` : "";
      return `[Đoạn ${i + 1} | file: ${p.file_name}${page}${heading}]\n${p.content}`;
    })
    .join("\n\n---\n\n");

  const system = `Bạn là trợ lý AI của Chi bộ trường học.

QUY TẮC BẮT BUỘC:
- Chỉ được trả lời dựa trên CONTEXT bên dưới.
- Nếu CONTEXT không có câu trả lời, chỉ trả lời đúng câu: "Tôi không tìm thấy thông tin trong các tài liệu đã tải lên."
- Không được tự suy đoán. Không được bịa.
- Nếu thông tin nằm ở nhiều tài liệu thì tổng hợp lại.
- Khi trích dẫn phải ghi rõ tên file (và số trang nếu có), ví dụ: (nguồn: nghi-quyet-thang-9.pdf, trang 2).
- Trả lời bằng tiếng Việt, văn phong hành chính, ngắn gọn, dùng gạch đầu dòng khi liệt kê.

CONTEXT:
${context || "(không có đoạn tài liệu nào liên quan)"}`;

  const json = (await gateway("/chat/completions", {
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: system },
      ...history.slice(-8),
      { role: "user", content: question },
    ],
  })) as { choices: { message: { content: string } }[] };

  return json.choices?.[0]?.message?.content?.trim() || "Xin lỗi, tôi chưa tạo được câu trả lời.";
}
