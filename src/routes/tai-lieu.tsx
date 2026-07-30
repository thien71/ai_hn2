import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extractTextFromFile } from "@/lib/extract-text";
import { addDocument, deleteDocument, listDocuments } from "@/lib/rag.functions";

export const Route = createFileRoute("/tai-lieu")({
  head: () => ({
    meta: [
      { title: "Kho tài liệu chi bộ | Trợ lý AI" },
      {
        name: "description",
        content:
          "Thêm nghị quyết, kế hoạch, báo cáo của chi bộ vào kho tài liệu để trợ lý AI tra cứu và trả lời.",
      },
      { property: "og:title", content: "Kho tài liệu chi bộ | Trợ lý AI" },
      {
        property: "og:description",
        content: "Quản lý văn bản chi bộ trường tiểu học dùng cho trợ lý AI hỏi đáp.",
      },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reading, setReading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useServerFn(listDocuments);
  const add = useServerFn(addDocument);
  const remove = useServerFn(deleteDocument);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => fetchDocs(),
  });

  const addMutation = useMutation({
    mutationFn: () => add({ data: { title, content } }),
    onSuccess: (result) => {
      toast.success(`Đã lưu tài liệu (${result.chunks} đoạn đã được xử lý).`);
      setTitle("");
      setContent("");
      if (fileRef.current) fileRef.current.value = "";
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

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setReading(true);
    try {
      const text = await extractTextFromFile(file);
      if (text.trim().length < 20) {
        toast.error("Không đọc được nội dung văn bản trong file (có thể là bản scan ảnh).");
      } else {
        setContent(text.trim());
        if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
        toast.success("Đã đọc nội dung file.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không đọc được file.");
    } finally {
      setReading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border bg-card p-5 shadow-panel">
          <h2 className="text-lg font-bold">Thêm tài liệu vào kho</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hỗ trợ tải lên PDF, Word (.docx), file văn bản (.txt, .md) hoặc dán trực tiếp nội dung.
          </p>

          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="title">Tên văn bản</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Nghị quyết chi bộ tháng 9/2026"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Tải file lên</Label>
              <Input
                id="file"
                type="file"
                ref={fileRef}
                accept=".pdf,.docx,.txt,.md,.doc"
                onChange={(e) => onFile(e.target.files?.[0])}
                disabled={reading}
              />
              {reading && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Đang đọc nội dung file…
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội dung văn bản</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="Dán toàn văn nội dung văn bản tại đây…"
                required
              />
              <p className="text-xs text-muted-foreground">{content.length.toLocaleString("vi-VN")} ký tự</p>
            </div>

            <Button type="submit" disabled={addMutation.isPending || content.trim().length < 20}>
              {addMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Lưu và huấn luyện AI
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
          <p className="mt-1 text-xs text-muted-foreground">
            Chưa có văn bản riêng? Nạp bộ tài liệu nghiệp vụ mẫu (đảng phí, chuyển sinh hoạt Đảng,
            nhận xét nơi cư trú, sinh hoạt chi bộ, chi bộ tiên phong chuyển đổi số) để dùng ngay.
          </p>
          {isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Đang tải…</p>
          ) : docs.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Chưa có tài liệu nào. Hãy thêm văn bản của chi bộ hoặc nạp bộ tài liệu mẫu.
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
                    <p className="truncate font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString("vi-VN")} ·{" "}
                      {doc.chars.toLocaleString("vi-VN")} ký tự · {doc.chunks} đoạn
                    </p>
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
