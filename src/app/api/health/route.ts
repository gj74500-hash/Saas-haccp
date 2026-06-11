import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Health + configuration diagnostics. If auth returns "There was a problem
 * with the server configuration", this endpoint pinpoints the cause without
 * needing shell access to the server.
 */
export async function GET() {
  const checks = {
    database: "ok" as "ok" | "unreachable" | "not_migrated",
    authSecret: Boolean(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
    databaseUrl: Boolean(process.env.DATABASE_URL),
  };

  try {
    // Touches a real table so a missing migration is detected too
    await db.user.count();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    checks.database = message.includes("does not exist") ? "not_migrated" : "unreachable";
  }

  const healthy = checks.database === "ok" && checks.authSecret && checks.databaseUrl;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      ...(healthy
        ? {}
        : {
            hint:
              checks.database === "unreachable"
                ? "PostgreSQL is not reachable at DATABASE_URL. Start it (docker compose up -d db) and verify the connection string."
                : checks.database === "not_migrated"
                  ? "Database is reachable but the schema is missing. Run: npx prisma migrate deploy && npm run db:seed"
                  : !checks.authSecret
                    ? "AUTH_SECRET is not set. Generate one with: openssl rand -base64 32 and add it to the deployment's environment variables, then redeploy."
                    : "DATABASE_URL is not set.",
          }),
    },
    { status: healthy ? 200 : 503 }
  );
}
