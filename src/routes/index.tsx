import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { AnswerText } from "@/components/AnswerText";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askQuestion, clearMessages, getMessages } from "@/lib/rag.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hỏi đáp văn bản chi bộ | Trợ lý AI" },
      {
        name: "description",
        content:
          "Nhập câu hỏi, AI tra cứu và trả lời dựa trên nghị quyết, kế hoạch, báo cáo của chi bộ trường tiểu học.",
      },
      { property: "og:title", content: "Hỏi đáp văn bản chi bộ | Trợ lý AI" },
      {
        property: "og:description",
        content: "Tra cứu văn bản chi bộ trường tiểu học bằng trợ lý AI, trả lời kèm nguồn trích dẫn.",
      },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "Nghị quyết tháng này đề ra những nhiệm vụ trọng tâm nào?",
  "Chỉ tiêu kết nạp đảng viên mới của chi bộ là bao nhiêu?",
  "Tóm tắt kết quả công tác kiểm tra, giám sát.",
];

function ChatPage() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useServerFn(getMessages);
  const ask = useServerFn(askQuestion);
  const clear = useServerFn(clearMessages);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: () => fetchMessages(),
  });

  const askMutation = useMutation({
    mutationFn: (question: string) => ask({ data: { question } }),
    onSuccess: (data) => queryClient.setQueryData(["messages"], data),
    onError: (error: Error) => toast.error(error.message || "Không gửi được câu hỏi."),
    onSettled: () => textareaRef.current?.focus(),
  });

  const clearMutation = useMutation({
    mutationFn: () => clear({ data: undefined }),
    onSuccess: () => {
      queryClient.setQueryData(["messages"], []);
      toast.success("Đã xoá cuộc trò chuyện.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const pending = askMutation.isPending;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  const submit = (question: string) => {
    const value = question.trim();
    if (!value || pending) return;
    setInput("");
    askMutation.mutate(value);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
        <div className="flex-1 space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải cuộc trò chuyện…</p>
          ) : messages.length === 0 ? (
            <section className="rounded-2xl border bg-card p-6 shadow-panel">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Sparkles className="size-5 text-primary" /> Bắt đầu tra cứu
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Đặt câu hỏi về nghị quyết, kế hoạch, báo cáo hoặc quy định của chi bộ. Trợ lý chỉ trả
                lời dựa trên tài liệu đã được đưa vào kho.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-left text-sm text-secondary-foreground transition-colors hover:border-primary hover:bg-accent/25"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-soft">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex justify-start">
                  <div className="max-w-[92%] rounded-2xl rounded-bl-sm border bg-card px-4 py-3 shadow-soft">
                    <AnswerText text={message.content} />
                    {message.sources.length > 0 && (
                      <div className="mt-3 border-t pt-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Nguồn tài liệu tham khảo
                        </p>
                        <ul className="mt-1.5 space-y-1">
                          {message.sources.map((source, i) => (
                            <li key={i} className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{source.title}</span> —{" "}
                              {source.snippet}…
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )
          )}

          {pending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Đang tra cứu tài liệu…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="sticky bottom-0 mt-6 rounded-2xl border bg-card p-3 shadow-panel"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Nhập câu hỏi về văn bản của chi bộ…"
            rows={2}
            className="resize-none border-0 shadow-none focus-visible:ring-0"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={messages.length === 0 || clearMutation.isPending}
              onClick={() => clearMutation.mutate()}
            >
              <RotateCcw className="size-4" /> Cuộc trò chuyện mới
            </Button>
            <Button type="submit" disabled={pending || input.trim().length < 2}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Gửi câu hỏi
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
