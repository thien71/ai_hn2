import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, History, Loader2, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { AnswerText } from "@/components/AnswerText";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { SUGGESTION_GROUPS, TOPICS, type TopicKey } from "@/lib/suggestions";
import { askQuestion, clearMessages, getMessages } from "@/lib/rag.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trợ lý AI chuyển đổi số | Chi bộ Hòa Nhơn 2" },
      {
        name: "description",
        content:
          "Trợ lý AI của Chi bộ Hòa Nhơn 2: hỏi đáp thủ tục hành chính Đảng, đảng phí, chuyển sinh hoạt Đảng và mô hình chi bộ tiên phong chuyển đổi số.",
      },
      { property: "og:title", content: "Trợ lý AI chuyển đổi số | Chi bộ Hòa Nhơn 2" },
      {
        property: "og:description",
        content:
          "Tra cứu nội bộ có kiểm soát nguồn — trợ lý chỉ trả lời theo tài liệu đã được duyệt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [topic, setTopic] = useState<TopicKey>("thu-tuc");
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
      toast.success("Đã làm mới cuộc tra cứu.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const pending = askMutation.isPending;
  const groups = SUGGESTION_GROUPS[topic];
  const topicMeta = TOPICS.find((t) => t.key === topic)!;
  const userQuestions = messages.filter((m) => m.role === "user");

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (messages.length > 0 || pending) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  const submit = (question: string) => {
    const value = question.trim();
    if (!value || pending) return;
    setInput("");
    askMutation.mutate(value);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[1.75fr_1fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border bg-card p-5 shadow-panel">
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 size-6 shrink-0 text-primary" />
              <div>
                <h2 className="font-serif text-lg leading-snug font-bold">
                  Hỗ trợ hỏi–đáp thủ tục hành chính Đảng và mô hình chi bộ tiên phong chuyển đổi số
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Trợ lý chỉ trả lời khi có căn cứ trong tài liệu chính thức đã được duyệt.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {TOPICS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTopic(t.key)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                    topic === t.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary hover:bg-accent/15",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form
              className="mt-4"
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
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                placeholder="Nhập câu hỏi... (Ctrl/⌘ + Enter để gửi)"
                rows={3}
                className="resize-none bg-background"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={pending || input.trim().length < 2}>
                  {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  Gửi câu hỏi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={messages.length === 0 || clearMutation.isPending}
                  onClick={() => clearMutation.mutate()}
                >
                  <RotateCcw className="size-4" /> Làm mới
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-panel">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Đang tải cuộc tra cứu…</p>
            ) : messages.length === 0 && !pending ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nhập câu hỏi hoặc chọn từ gợi ý để bắt đầu tra cứu.
              </p>
            ) : (
              <div className="space-y-4">
                {messages.map((message) =>
                  message.role === "user" ? (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-soft">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="rounded-xl border-l-4 border-primary bg-background px-4 py-3">
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
                  ),
                )}
                {pending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Đang tra cứu tài liệu…
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </section>

          <Collapsible className="rounded-2xl border bg-card shadow-panel">
            <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <History className="size-4 text-primary" /> Lịch sử tra cứu ({userQuestions.length})
              </span>
              <ChevronDown className="size-4 transition-transform [[data-state=open]_&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t px-5 py-3">
              {userQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có câu hỏi nào.</p>
              ) : (
                <ul className="space-y-2">
                  {userQuestions.map((q) => (
                    <li key={q.id} className="text-sm text-muted-foreground">
                      • {q.content}
                    </li>
                  ))}
                </ul>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        <aside className="h-fit rounded-2xl border bg-card p-5 shadow-panel">
          <h2 className="font-serif text-sm font-bold tracking-wide text-primary uppercase">
            {topicMeta.heading}
          </h2>
          <Accordion type="single" collapsible defaultValue={groups[0].group} className="mt-2">
            {groups.map((g) => (
              <AccordionItem key={g.group} value={g.group}>
                <AccordionTrigger className="text-left text-sm font-semibold text-primary">
                  {g.group}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {g.questions.map((q) => (
                      <li key={q}>
                        <button
                          type="button"
                          onClick={() => submit(q)}
                          disabled={pending}
                          className="text-left text-sm text-muted-foreground transition-colors hover:text-primary disabled:opacity-60"
                        >
                          • {q}
                        </button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </aside>
      </main>

      <footer className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Chi bộ Hòa Nhơn 2 — Hệ thống nội bộ. Trợ lý AI chỉ trả lời theo
        tài liệu đã được duyệt.
      </footer>
    </div>
  );
}
