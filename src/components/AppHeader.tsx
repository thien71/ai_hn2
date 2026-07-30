import { Link } from "@tanstack/react-router";
import { BookOpenText, MessagesSquare } from "lucide-react";

export function AppHeader() {
  return (
    <header className="banner-gradient text-primary-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/90 text-accent-foreground">
            <BookOpenText className="size-6" />
          </div>
          <div>
            <h1 className="text-lg leading-tight font-bold sm:text-xl">
              Trợ lý AI văn bản chi bộ
            </h1>
            <p className="text-sm opacity-85">Chi bộ Trường Tiểu học</p>
          </div>
        </div>
        <nav className="flex gap-2">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-foreground/15 [&.active]:bg-primary-foreground/20"
          >
            <MessagesSquare className="size-4" /> Hỏi đáp
          </Link>
          <Link
            to="/tai-lieu"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-foreground/15 [&.active]:bg-primary-foreground/20"
          >
            <BookOpenText className="size-4" /> Kho tài liệu
          </Link>
        </nav>
      </div>
    </header>
  );
}
