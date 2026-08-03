import { Link } from "@tanstack/react-router";
import { BookOpenText, MessagesSquare } from "lucide-react";
import logoAsset from "@/assets/logo-truong.png.asset.json";

export function AppHeader() {
  return (
    <header className="border-b-4 border-primary bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Biểu trưng Chi bộ Hòa Nhơn 2"
            width={512}
            height={512}
            className="size-14 shrink-0 object-contain sm:size-16"
          />
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              Chi bộ Hòa Nhơn 2
            </p>
            <h1 className="font-serif text-xl leading-tight font-extrabold text-primary sm:text-2xl">
              TRỢ LÝ AI CHUYỂN ĐỔI SỐ
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Hỏi – đáp công tác Đảng và mô hình chi bộ tiên phong chuyển đổi số
            </p>
          </div>
        </div>
        <nav className="flex gap-2">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/20 [&.active]:bg-primary [&.active]:text-primary-foreground"
          >
            <MessagesSquare className="size-4" /> Hỏi đáp
          </Link>
          <Link
            to="/tai-lieu"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/20 [&.active]:bg-primary [&.active]:text-primary-foreground"
          >
            <BookOpenText className="size-4" /> Kho tài liệu
          </Link>
        </nav>
      </div>
    </header>
  );
}
