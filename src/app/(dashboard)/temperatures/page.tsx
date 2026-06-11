import type { Metadata } from "next";
import { Thermometer } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ModulePlaceholder } from "@/components/features/module-placeholder";

export const metadata: Metadata = { title: "Temperatures" };

export default async function TemperaturesPage() {
  const t = await getTranslations("nav");
  return (
    <ModulePlaceholder
      title={t("temperatures")}
      description="Fridge, freezer and cooking temperature logs with corrective actions and PDF export ship in the next phase."
      icon={Thermometer}
    />
  );
}
