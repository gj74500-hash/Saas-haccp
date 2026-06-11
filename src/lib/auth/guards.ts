import { redirect } from "next/navigation";
import { auth } from "./auth";
import { can, type Capability } from "./permissions";

export type SessionUser = {
  id: string;
  email: string;
  companyId: string;
  role: "OWNER" | "MANAGER" | "EMPLOYEE";
  firstName: string;
  lastName: string;
};

/**
 * Resolves the authenticated user or redirects to /login.
 * Every server component, server action and route handler that touches
 * tenant data must obtain the user (and its companyId) through this guard.
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user as SessionUser;
}

/** Like requireUser, but also enforces a capability. */
export async function requireCapability(capability: Capability): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, capability)) redirect("/dashboard");
  return user;
}
