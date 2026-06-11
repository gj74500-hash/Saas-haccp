import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ModulePlaceholder } from "@/components/features/module-placeholder";

export const metadata: Metadata = { title: "Alerts" };

export default async function AlertsPage() {
  const t = await getTranslations("nav");
  return (
    <ModulePlaceholder
      title={t("alerts")}
      description="The alert center with acknowledgement, resolution and push notifications ships in an upcoming phase."
      icon={Bell}
    />
  );
}
