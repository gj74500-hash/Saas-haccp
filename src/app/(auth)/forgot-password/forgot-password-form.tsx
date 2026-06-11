"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { requestPasswordReset } from "@/actions/auth";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    startTransition(async () => {
      await requestPasswordReset(parsed.data);
      setSent(true);
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>
      </div>

      {sent ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
          {t("success")}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField label={t("email")} htmlFor="email" error={fieldErrors.email?.[0]}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={!!fieldErrors.email}
              required
            />
          </FormField>

          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
