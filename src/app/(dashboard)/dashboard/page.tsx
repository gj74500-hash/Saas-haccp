import type { Metadata } from "next";
import { getTranslations, getFormatter } from "next-intl/server";
import {
  ShieldCheck,
  SprayCan,
  Bell,
  Thermometer,
  CheckCircle2,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { getDashboardData } from "@/lib/services/dashboard.service";
import { formatTemperature } from "@/lib/utils";
import { KpiCard } from "@/components/features/dashboard/kpi-card";
import { ComplianceRing } from "@/components/features/dashboard/compliance-ring";
import { EmptyState } from "@/components/features/dashboard/empty-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Dashboard" };

const severityVariant = {
  INFO: "info",
  WARNING: "warning",
  CRITICAL: "danger",
} as const;

export default async function DashboardPage() {
  const user = await requireUser();
  const [data, t, format] = await Promise.all([
    getDashboardData(user.companyId),
    getTranslations(),
    getFormatter(),
  ]);

  const ago = (date: Date) => format.relativeTime(date);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {t("dashboard.greeting", { name: user.firstName })}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("dashboard.title")}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t("dashboard.complianceScore")}
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {t("dashboard.complianceScoreHint")}
              </p>
            </div>
            <ComplianceRing score={data.compliance.score} />
          </div>
        </Card>
        <KpiCard
          label={t("dashboard.openTasks")}
          value={String(data.openTaskCount)}
          hint={t("dashboard.openTasksHint")}
          icon={SprayCan}
          tone={data.openTaskCount > 0 ? "warning" : "success"}
        />
        <KpiCard
          label={t("dashboard.activeAlerts")}
          value={String(data.activeAlertCount)}
          hint={t("dashboard.activeAlertsHint")}
          icon={Bell}
          tone={data.activeAlertCount > 0 ? "danger" : "success"}
        />
        <KpiCard
          label={t("dashboard.tempChecksToday")}
          value={String(data.tempChecksToday)}
          hint={t("dashboard.tempChecksTodayHint")}
          icon={Thermometer}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Temperature alerts */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.temperatureAlerts")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.temperatureAlerts.length === 0 ? (
              <EmptyState icon={ShieldCheck} message={t("dashboard.noTemperatureAlerts")} />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.temperatureAlerts.map((alert) => (
                  <li key={alert.id} className="flex items-start gap-3 px-5 py-4">
                    <span className="mt-0.5 text-amber-500">
                      <AlertTriangle className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {alert.title}
                        </p>
                        <Badge variant={severityVariant[alert.severity]}>
                          {t(`alerts.severity.${alert.severity}`)}
                        </Badge>
                        <Badge variant="neutral">{t(`alerts.status.${alert.status}`)}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {alert.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {ago(alert.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Open cleaning tasks */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.openCleaningTasks")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.openTasks.length === 0 ? (
              <EmptyState icon={CheckCircle2} message={t("dashboard.noOpenTasks")} />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.openTasks.map((task) => (
                  <li key={task.id} className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {task.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {task.area ? `${task.area} · ` : ""}
                      {task.assignedTo
                        ? t("dashboard.assignedTo", {
                            name: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
                          })
                        : t("dashboard.unassigned")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Latest readings */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.latestReadings")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.latestReadings.length === 0 ? (
              <EmptyState icon={Thermometer} message={t("dashboard.noReadings")} />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.latestReadings.map((reading) => (
                  <li
                    key={reading.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {reading.equipmentName ?? reading.type}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {t("dashboard.by", {
                          name: `${reading.recordedBy.firstName} ${reading.recordedBy.lastName}`,
                        })}{" "}
                        · {ago(reading.recordedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatTemperature(reading.value)}
                      </span>
                      <Badge variant={reading.isCompliant ? "success" : "danger"}>
                        {reading.isCompliant
                          ? t("dashboard.compliant")
                          : t("dashboard.nonCompliant")}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
            <CardDescription>{t("common.appName")}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentActivity.length === 0 ? (
              <EmptyState icon={Activity} message={t("dashboard.noRecentActivity")} />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recentActivity.map((entry) => {
                  const name = entry.user
                    ? `${entry.user.firstName} ${entry.user.lastName}`
                    : "System";
                  const actionKey = `activity.${entry.action}`;
                  return (
                    <li key={entry.id} className="px-5 py-3">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {name}
                        </span>{" "}
                        {t.has(actionKey) ? t(actionKey) : t("activity.unknown")}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                        {ago(entry.createdAt)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
