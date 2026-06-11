"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { resetPassword } from "@/actions/auth";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("auth.resetPassword");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      token,
      ...Object.fromEntries(formData),
    });
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    startTransition(async () => {
      const result = await resetPassword(parsed.data);
      if (!result.ok) {
        setError(result.error === "invalid_token" ? t("invalidToken") : result.error);
        return;
      }
      setDone(true);
    });
  }

  const tLogin = useTranslations("auth.login");

  if (done) {
    return (
      <div className="text-center">
        <p className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
          {t("success")}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          {tLogin("submit")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField
          label={t("password")}
          htmlFor="password"
          error={fieldErrors.password?.[0]}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!fieldErrors.password}
            required
          />
        </FormField>

        <FormField
          label={t("confirmPassword")}
          htmlFor="confirmPassword"
          error={fieldErrors.confirmPassword?.[0]}
        >
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!fieldErrors.confirmPassword}
            required
          />
        </FormField>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </div>
  );
}
