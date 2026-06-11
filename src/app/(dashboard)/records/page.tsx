import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ModulePlaceholder } from "@/components/features/module-placeholder";

export const metadata: Metadata = { title: "HACCP Records" };

export default async function RecordsPage() {
  const t = await getTranslations("nav");
  return (
    <ModulePlaceholder
      title={t("records")}
      description="Digital HACCP forms, custom form builder, signatures and the audit trail ship in an upcoming phase."
      icon={ClipboardList}
    />
  );
}
