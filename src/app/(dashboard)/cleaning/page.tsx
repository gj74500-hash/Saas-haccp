import type { Metadata } from "next";
import { SprayCan } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ModulePlaceholder } from "@/components/features/module-placeholder";

export const metadata: Metadata = { title: "Cleaning" };

export default async function CleaningPage() {
  const t = await getTranslations("nav");
  return (
    <ModulePlaceholder
      title={t("cleaning")}
      description="Cleaning schedules, checklists, task assignment and completion tracking ship in an upcoming phase."
      icon={SprayCan}
    />
  );
}
