import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ModulePlaceholder } from "@/components/features/module-placeholder";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const t = await getTranslations("nav");
  return (
    <ModulePlaceholder
      title={t("settings")}
      description="Company settings, locations, team management and permissions ship in an upcoming phase."
      icon={Settings}
    />
  );
}
