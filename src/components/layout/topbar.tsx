import { LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { signOut } from "@/lib/auth/auth";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { initials } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/guards";

export async function Topbar({ user }: { user: SessionUser }) {
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
      <div className="lg:hidden">
        <Logo />
      </div>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-1.5">
        <div className="mr-2 flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800 dark:bg-brand-500/15 dark:text-brand-300"
            aria-hidden
          >
            {initials(user.firstName, user.lastName)}
          </span>
          <div className="hidden text-sm sm:block">
            <p className="font-medium leading-tight text-slate-900 dark:text-slate-100">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs leading-tight text-slate-500 dark:text-slate-400">
              {t(`roles.${user.role}`)}
            </p>
          </div>
        </div>

        <ThemeToggle />

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            title={t("common.signOut")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span className="sr-only">{t("common.signOut")}</span>
          </button>
        </form>
      </div>
    </header>
  );
}
