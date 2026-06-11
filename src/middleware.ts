import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

// Edge middleware: route protection only. The Credentials provider (Prisma,
// bcrypt) lives in src/lib/auth/auth.ts which runs in the Node runtime.
const { auth } = NextAuth(authConfig);

const hasSecret = () =>
  Boolean(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET);

/**
 * Without a session secret, Auth.js throws on every request the middleware
 * touches — the whole app becomes an opaque `{"message":"There was a problem
 * with the server configuration..."}`. Render a readable setup page instead.
 */
function setupErrorResponse(): NextResponse {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Setup required · HACCP Pro</title>
<style>
  body{font-family:ui-sans-serif,system-ui,sans-serif;background:#f8fafc;color:#0f172a;display:flex;min-height:100dvh;align-items:center;justify-content:center;margin:0;padding:24px}
  @media (prefers-color-scheme:dark){body{background:#020617;color:#f1f5f9}.card{background:#0f172a;border-color:#1e293b}code{background:#1e293b}}
  .card{max-width:560px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:32px}
  h1{font-size:20px;margin:0 0 8px}
  p{font-size:14px;line-height:1.6;color:inherit;opacity:.85}
  code{background:#f1f5f9;border-radius:6px;padding:2px 6px;font-size:13px}
  ol{font-size:14px;line-height:1.8;padding-left:20px}
  a{color:#059669}
</style>
</head>
<body>
<div class="card">
  <h1>⚠️ HACCP Pro — setup required</h1>
  <p>The server is missing its session secret, so authentication cannot start.
  This is a deployment configuration issue, not a bug.</p>
  <ol>
    <li>Generate a secret: <code>openssl rand -base64 32</code></li>
    <li>Add it as an environment variable named <code>AUTH_SECRET</code>
        (in Vercel: Project → Settings → Environment Variables, then redeploy).</li>
    <li>Also make sure <code>DATABASE_URL</code> points at a hosted PostgreSQL database.</li>
  </ol>
  <p>Full diagnostics: <a href="/api/health">/api/health</a></p>
</div>
</body>
</html>`;
  return new NextResponse(html, {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!hasSecret()) {
    return setupErrorResponse();
  }
  return (
    auth as unknown as (
      req: NextRequest,
      ev: NextFetchEvent
    ) => Response | Promise<Response>
  )(request, event);
}

export const config = {
  matcher: [
    // Everything except static assets, PWA files, the health check and
    // NextAuth's own routes
    "/((?!api/auth|api/health|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|robots.txt).*)",
  ],
};
