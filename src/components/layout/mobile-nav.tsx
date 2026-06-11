"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

/** Bottom tab bar for phones — primary navigation for kitchen staff. */
export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const items = navItems.filter((item) => item.mobile);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Main"
    >
      <div className="grid h-16 grid-cols-4">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[11px] font-medium",
                active ? "text-brand-700" : "text-slate-500"
              )}
            >
              <Icon className="h-5 w-5" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
