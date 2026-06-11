import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = await getTranslations("auth.resetPassword");

  if (!token) {
    return (
      <div className="text-center">
        <p className="rounded-lg bg-red-50 px-3 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {t("invalidToken")}
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-sm font-medium text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
        >
          {t("title")}
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
