import type { NextAuthConfig } from "next-auth";

// Edge-safe configuration (no Prisma/bcrypt imports) shared between the
// middleware and the full Node auth setup in auth.ts.
export const authConfig = {
  // The app always runs behind a trusted proxy (Docker, Vercel, Railway, …).
  // Without this, any deployment where AUTH_TRUST_HOST isn't set fails every
  // auth request with a generic "server configuration" error.
  trustHost: true,
  // Auth.js v5 only reads AUTH_SECRET; accept the v4 name as an alias since
  // many guides (and old deployments) still set NEXTAUTH_SECRET.
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 hours — shared devices are common in kitchens
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password");

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.companyId = user.companyId;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.companyId = token.companyId as string;
      session.user.role = token.role as "OWNER" | "MANAGER" | "EMPLOYEE";
      session.user.firstName = token.firstName as string;
      session.user.lastName = token.lastName as string;
      return session;
    },
  },
  providers: [], // configured in auth.ts (Node runtime only)
} satisfies NextAuthConfig;
