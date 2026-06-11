import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        let user;
        try {
          user = await db.user.findUnique({
            where: { email: email.toLowerCase() },
          });
        } catch (error) {
          // Surfaces as a "server configuration" error to the client; make
          // the real cause obvious in the server logs.
          console.error(
            "[auth] Database unreachable during login. Check DATABASE_URL and that PostgreSQL is running and migrated (see /api/health).",
            error
          );
          throw error;
        }
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Fire-and-forget bookkeeping; login must not fail on it
        db.user
          .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
          .catch(() => {});
        void audit({
          companyId: user.companyId,
          userId: user.id,
          action: "user.login",
          entityType: "User",
          entityId: user.id,
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          companyId: user.companyId,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
});
