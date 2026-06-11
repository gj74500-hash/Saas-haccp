import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

// Edge middleware: route protection only. The Credentials provider (Prisma,
// bcrypt) lives in src/lib/auth/auth.ts which runs in the Node runtime.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    // Everything except static assets, PWA files, the health check and
    // NextAuth's own routes
    "/((?!api/auth|api/health|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|robots.txt).*)",
  ],
};
