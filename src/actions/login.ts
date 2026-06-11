"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth/auth";

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<{ ok: false; error: string } | never> {
  try {
    await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirectTo: "/dashboard",
    });
    // signIn redirects on success; this line is unreachable
    throw new Error("unreachable");
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "invalid_credentials" };
    }
    // NEXT_REDIRECT must propagate for the redirect to happen
    throw error;
  }
}
