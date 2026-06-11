import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ModulePlaceholder } from "@/components/features/module-placeholder";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const t = await getTranslations("nav");
  return (
    <ModulePlaceholder
      title={t("reports")}
      description="Daily, weekly and monthly compliance reports with PDF export ship in an upcoming phase."
      icon={BarChart3}
    />
  );
}
