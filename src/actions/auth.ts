"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { sendPasswordResetEmail } from "@/lib/mail";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

/**
 * Self-serve sign-up: creates the Company (tenant), its default Location,
 * a trial Subscription and the OWNER user atomically.
 */
export async function registerCompany(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { companyName, firstName, lastName, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "email_taken" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const baseSlug = slugify(companyName) || "company";
  let slug = baseSlug;
  for (let i = 2; await db.company.findUnique({ where: { slug } }); i++) {
    slug = `${baseSlug}-${i}`;
  }

  const company = await db.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: companyName,
        slug,
        subscription: {
          create: {
            plan: "TRIAL",
            status: "TRIALING",
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    const location = await tx.location.create({
      data: { companyId: company.id, name: "Main location" },
    });

    await tx.user.create({
      data: {
        companyId: company.id,
        email,
        passwordHash,
        firstName,
        lastName,
        role: "OWNER",
        locations: { create: { locationId: location.id } },
      },
    });

    return company;
  });

  await audit({
    companyId: company.id,
    action: "company.create",
    entityType: "Company",
    entityId: company.id,
  });

  return { ok: true };
}

/**
 * Issues a single-use, hashed reset token. Always returns ok to avoid
 * leaking which emails have accounts.
 */
export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({ where: { email } });

  if (user && user.isActive) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await sendPasswordResetEmail(user.email, `${appUrl}/reset-password?token=${token}`);
  }

  return { ok: true };
}

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(parsed.data.token)
    .digest("hex");

  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { ok: false, error: "invalid_token" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await db.$transaction([
    db.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await audit({
    companyId: resetToken.user.companyId,
    userId: resetToken.userId,
    action: "password.reset",
    entityType: "User",
    entityId: resetToken.userId,
  });

  return { ok: true };
}
