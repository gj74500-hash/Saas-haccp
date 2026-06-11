"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { registerCompany } from "@/actions/auth";
import { loginAction } from "@/actions/login";
import { registerSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const parsed = registerSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    startTransition(async () => {
      const result = await registerCompany(parsed.data);
      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        setError(result.error === "email_taken" ? t("emailTaken") : null);
        if (result.error !== "email_taken" && !result.fieldErrors) {
          setError(result.error);
        }
        return;
      }
      // Sign the new owner straight in (redirects to /dashboard)
      const login = await loginAction({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (login && !login.ok) router.push("/login");
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField
          label={t("companyName")}
          htmlFor="companyName"
          error={fieldErrors.companyName?.[0]}
        >
          <Input
            id="companyName"
            name="companyName"
            placeholder="The Olive Tree Bistro"
            aria-invalid={!!fieldErrors.companyName}
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label={t("firstName")}
            htmlFor="firstName"
            error={fieldErrors.firstName?.[0]}
          >
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              aria-invalid={!!fieldErrors.firstName}
              required
            />
          </FormField>
          <FormField
            label={t("lastName")}
            htmlFor="lastName"
            error={fieldErrors.lastName?.[0]}
          >
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              aria-invalid={!!fieldErrors.lastName}
              required
            />
          </FormField>
        </div>

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

        <FormField
          label={t("password")}
          htmlFor="password"
          hint={t("passwordHint")}
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

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
