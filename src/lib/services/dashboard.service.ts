import { db } from "@/lib/db";
import { getComplianceScore, type ComplianceScore } from "@/lib/compliance-score";

export type DashboardData = {
  compliance: ComplianceScore;
  activeAlertCount: number;
  openTaskCount: number;
  tempChecksToday: number;
  temperatureAlerts: {
    id: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
    title: string;
    message: string;
    status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
    createdAt: Date;
  }[];
  openTasks: {
    id: string;
    name: string;
    area: string | null;
    frequency: string;
    assignedTo: { firstName: string; lastName: string } | null;
  }[];
  latestReadings: {
    id: string;
    value: number;
    isCompliant: boolean;
    recordedAt: Date;
    equipmentName: string | null;
    type: string;
    recordedBy: { firstName: string; lastName: string };
  }[];
  recentActivity: {
    id: string;
    action: string;
    createdAt: Date;
    user: { firstName: string; lastName: string } | null;
  }[];
};

/** All dashboard queries are scoped to the caller's company (tenant). */
export async function getDashboardData(companyId: string): Promise<DashboardData> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    compliance,
    activeAlertCount,
    tempChecksToday,
    temperatureAlerts,
    openTasks,
    latestReadings,
    recentActivity,
  ] = await Promise.all([
    getComplianceScore(companyId),
    db.alert.count({ where: { companyId, status: { not: "RESOLVED" } } }),
    db.temperatureLog.count({
      where: { companyId, recordedAt: { gte: startOfToday } },
    }),
    db.alert.findMany({
      where: {
        companyId,
        type: "TEMP_OUT_OF_RANGE",
        status: { not: "RESOLVED" },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        severity: true,
        title: true,
        message: true,
        status: true,
        createdAt: true,
      },
    }),
    db.cleaningTask.findMany({
      where: {
        companyId,
        isActive: true,
        completions: {
          none: {
            status: "COMPLETED",
            dueDate: { gte: startOfToday },
          },
        },
      },
      orderBy: { name: "asc" },
      take: 6,
      select: {
        id: true,
        name: true,
        area: true,
        frequency: true,
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    }),
    db.temperatureLog.findMany({
      where: { companyId },
      orderBy: { recordedAt: "desc" },
      take: 6,
      select: {
        id: true,
        value: true,
        isCompliant: true,
        recordedAt: true,
        type: true,
        equipment: { select: { name: true } },
        recordedBy: { select: { firstName: true, lastName: true } },
      },
    }),
    db.auditLog.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        action: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  const openTaskCount = await db.cleaningTask.count({
    where: {
      companyId,
      isActive: true,
      completions: {
        none: { status: "COMPLETED", dueDate: { gte: startOfToday } },
      },
    },
  });

  return {
    compliance,
    activeAlertCount,
    openTaskCount,
    tempChecksToday,
    temperatureAlerts,
    openTasks,
    latestReadings: latestReadings.map((r) => ({
      id: r.id,
      value: r.value,
      isCompliant: r.isCompliant,
      recordedAt: r.recordedAt,
      equipmentName: r.equipment?.name ?? null,
      type: r.type,
      recordedBy: r.recordedBy,
    })),
    recentActivity,
  };
}
