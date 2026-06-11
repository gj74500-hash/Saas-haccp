import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type AuditEntry = {
  companyId: string;
  userId?: string | null;
  /** Dot-separated action, e.g. "temperature.create" */
  action: string;
  entityType?: string;
  entityId?: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  ipAddress?: string | null;
};

/**
 * Appends an entry to the immutable audit trail. Audit failures are logged
 * but never propagate — a missing audit row must not break the user's action.
 * (For regulated deployments this trade-off can be flipped per-action.)
 */
export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await db.auditLog.create({ data: entry });
  } catch (error) {
    console.error("[audit] failed to write audit log", entry.action, error);
  }
}
