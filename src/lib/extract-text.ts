// Trích xuất văn bản từ file phía trình duyệt (txt, md, docx, pdf).
export type ExtractedFile = {
  title: string;
  fileName: string;
  fileType: string;
  pages: string[];
  needsOcr: boolean;
  chars: number;
  hash: string;
};

async function sha256(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function extractPdf(buffer: ArrayBuffer): Promise<string[]> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/[ \t]+/g, " ")
        .trim(),
    );
  }
  return pages;
}

export async function extractFile(file: File): Promise<ExtractedFile> {
  const name = file.name;
  const lower = name.toLowerCase();
  const ext = lower.split(".").pop() ?? "";
  const buffer = await file.arrayBuffer();
  const hash = await sha256(buffer);
  const title = name.replace(/\.[^.]+$/, "");

  let pages: string[] = [];

  if (ext === "docx") {
    const mammoth = await import("mammoth/mammoth.browser");
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    pages = [result.value];
  } else if (ext === "pdf") {
    pages = await extractPdf(buffer);
  } else if (ext === "doc") {
    throw new Error(`${name}: file .doc cũ chưa hỗ trợ, hãy lưu lại thành .docx hoặc .pdf.`);
  } else if (["txt", "md", "csv", "json"].includes(ext)) {
    pages = [new TextDecoder("utf-8").decode(buffer)];
  } else {
    throw new Error(`${name}: định dạng .${ext} chưa được hỗ trợ (chỉ PDF, DOCX, TXT).`);
  }

  const chars = pages.join("").replace(/\s/g, "").length;
  // PDF gần như không có text ⇒ khả năng cao là bản scan, cần OCR.
  const needsOcr = ext === "pdf" && chars < Math.max(80, pages.length * 40);

  return {
    title,
    fileName: name,
    fileType: ext,
    pages,
    needsOcr,
    chars,
    hash,
  };
}

/** Giữ lại cho tương thích: trả về toàn văn dạng chuỗi. */
export async function extractTextFromFile(file: File): Promise<string> {
  const result = await extractFile(file);
  return result.pages.join("\n\n");
}
