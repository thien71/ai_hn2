import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { AlertTriangle, FileText, Loader2, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extractFile } from "@/lib/extract-text";
import {
  addDocument,
  deleteDocument,
  findDocumentByHash,
  listDocuments,
  seedSampleDocuments,
} from "@/lib/rag.functions";

export const Route = createFileRoute("/tai-lieu")({
  head: () => ({
    meta: [
      { title: "Kho tài liệu chi bộ | Trợ lý AI" },
      {
        name: "description",
        content:
          "Tải lên PDF, DOCX, TXT của chi bộ. Hệ thống tự chia đoạn, tạo embedding và tra cứu theo ngữ nghĩa.",
      },
      { property: "og:title", content: "Kho tài liệu chi bộ | Trợ lý AI" },
      {
        property: "og:description",
        content: "Quản lý văn bản chi bộ trường tiểu học dùng cho trợ lý AI hỏi đáp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocumentsPage,
});

type LogItem = { file: string; status: "ok" | "skip" | "error" | "ocr"; detail: string };

function DocumentsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [log, setLog] = useState<LogItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useServerFn(listDocuments);
  const add = useServerFn(addDocument);
  const remove = useServerFn(deleteDocument);
  const findHash = useServerFn(findDocumentByHash);
  const seed = useServerFn(seedSampleDocuments);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => fetchDocs(),
  });

  const seedMutation = useMutation({
    mutationFn: () => seed({ data: undefined }),
    onSuccess: (result) => {
      toast.success(
        result.added > 0
          ? `Đã nạp ${result.added} tài liệu mẫu.`
          : "Bộ tài liệu mẫu đã có sẵn trong kho.",
      );
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error: Error) => toast.error(error.message || "Không nạp được tài liệu mẫu."),
  });

  const pasteMutation = useMutation({
    mutationFn: () =>
      add({ data: { title, pages: [content], fileName: `${title}.txt`, fileType: "txt" } }),
    onSuccess: (result) => {
      toast.success(`Đã lưu tài liệu (${result.chunks} đoạn đã lập chỉ mục).`);
      setTitle("");
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error: Error) => toast.error(error.message || "Không lưu được tài liệu."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Đã xoá tài liệu.");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setBusy(true);
    setLog([]);
    setProgress({ done: 0, total: list.length });

    for (const file of list) {
      try {
        const extracted = await extractFile(file);

        // Cache: file không thay đổi thì bỏ qua, không tạo lại embedding.
        const found = await findHash({ data: { hash: extracted.hash } });
        if (found.exists) {
          setLog((l) => [...l, { file: file.name, status: "skip", detail: "đã có trong kho — bỏ qua" }]);
          setProgress((p) => ({ ...p, done: p.done + 1 }));
          continue;
        }

        if (extracted.needsOcr) {
          setLog((l) => [
            ...l,
            {
              file: file.name,
              status: "ocr",
              detail: "PDF là bản scan ảnh, không đọc được chữ — cần OCR trước khi tải lên",
            },
          ]);
          setProgress((p) => ({ ...p, done: p.done + 1 }));
          continue;
        }

        const result = await add({
          data: {
            title: extracted.title,
            pages: extracted.pages,
            fileName: extracted.fileName,
            fileType: extracted.fileType,
            contentHash: extracted.hash,
            needsOcr: false,
          },
        });
        setLog((l) => [
          ...l,
          {
            file: file.name,
            status: result.skipped ? "skip" : "ok",
            detail: result.skipped
              ? "đã có trong kho — bỏ qua"
              : `${result.chunks} đoạn · ${extracted.pages.length > 1 ? `${extracted.pages.length} trang` : "1 phần"}`,
          },
        ]);
      } catch (error) {
        setLog((l) => [
          ...l,
          {
            file: file.name,
            status: "error",
            detail: error instanceof Error ? error.message : "lỗi không xác định",
          },
        ]);
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    queryClient.invalidateQueries({ queryKey: ["documents"] });
    toast.success("Đã xử lý xong danh sách file.");
  };

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border bg-card p-5 shadow-panel">
          <h2 className="text-lg font-bold">Tải tài liệu lên kho</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chọn nhiều file cùng lúc (PDF, DOCX, TXT). Hệ thống đọc toàn văn, chia đoạn 500–800 từ
            (chồng lấp 100 từ), lưu tên file · số trang · tiêu đề mục và tạo embedding cho từng đoạn.
          </p>

          <div className="mt-4 space-y-2">
            <Label htmlFor="files">Chọn file (có thể chọn hàng loạt)</Label>
            <Input
              id="files"
              type="file"
              multiple
              ref={fileRef}
              accept=".pdf,.docx,.txt,.md"
              onChange={(e) => onFiles(e.target.files)}
              disabled={busy}
            />
            {busy && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Đang xử lý {progress.done}/
                {progress.total} file…
              </p>
            )}
          </div>

          {log.length > 0 && (
            <ul className="mt-4 space-y-1.5 rounded-xl border bg-background p-3 text-xs">
              {log.map((item, i) => (
                <li key={i} className="flex gap-2">
                  {item.status === "ok" ? (
                    <span className="font-semibold text-primary">✓</span>
                  ) : item.status === "skip" ? (
                    <span className="font-semibold text-muted-foreground">↺</span>
                  ) : (
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                  )}
                  <span className="min-w-0">
                    <span className="font-medium">{item.file}</span> — {item.detail}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <form
            className="mt-6 space-y-4 border-t pt-5"
            onSubmit={(e) => {
              e.preventDefault();
              pasteMutation.mutate();
            }}
          >
            <h3 className="text-sm font-semibold">Hoặc dán nội dung văn bản</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Tên văn bản</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Nghị quyết chi bộ tháng 9/2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Nội dung</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="Dán toàn văn nội dung văn bản tại đây…"
              />
              <p className="text-xs text-muted-foreground">
                {content.length.toLocaleString("vi-VN")} ký tự
              </p>
            </div>
            <Button
              type="submit"
              disabled={pasteMutation.isPending || content.trim().length < 20 || !title.trim()}
            >
              {pasteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Lưu và lập chỉ mục
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Tài liệu hiện có ({docs.length})</h2>
            <Button
              variant="outline"
              size="sm"
              disabled={seedMutation.isPending}
              onClick={() => seedMutation.mutate()}
            >
              {seedMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Nạp bộ tài liệu mẫu
            </Button>
          </div>
          {isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Đang tải…</p>
          ) : docs.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Chưa có tài liệu nào. Hãy tải văn bản của chi bộ lên hoặc nạp bộ tài liệu mẫu.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {docs.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-start gap-3 rounded-xl border bg-background p-3"
                >
                  <FileText className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{doc.file_name ?? doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString("vi-VN")} ·{" "}
                      {doc.chars.toLocaleString("vi-VN")} ký tự · {doc.chunks} đoạn
                      {doc.page_count ? ` · ${doc.page_count} trang` : ""}
                    </p>
                    {doc.needs_ocr && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle className="size-3.5" /> Bản scan — cần OCR
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Xoá ${doc.title}`}
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(doc.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
