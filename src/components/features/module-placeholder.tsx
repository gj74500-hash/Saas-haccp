import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Temporary stand-in for feature modules that ship in later phases
 * (temperatures, cleaning, records, alerts, reports, settings).
 */
export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <Card className="mt-6 flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="max-w-sm text-sm text-slate-500">{description}</p>
      </Card>
    </div>
  );
}
