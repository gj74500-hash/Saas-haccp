// Compliance score: a weighted 0–100 measure of HACCP discipline over the
// last 7 days. Computed on demand from primary records (never stored), so it
// is always consistent with the underlying data.
//
//   60% — temperature compliance: share of readings within range
//   40% — cleaning completion:    completed vs. (completed + missed) occurrences
//
// Components with no data are excluded and weights renormalized, so a brand
// new account isn't penalized for having no history yet.

import { db } from "@/lib/db";

export type ComplianceScore = {
  score: number | null;
  temperature: { compliant: number; total: number };
  cleaning: { completed: number; total: number };
};

export async function getComplianceScore(companyId: string): Promise<ComplianceScore> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [tempTotal, tempCompliant, completions] = await Promise.all([
    db.temperatureLog.count({ where: { companyId, recordedAt: { gte: since } } }),
    db.temperatureLog.count({
      where: { companyId, recordedAt: { gte: since }, isCompliant: true },
    }),
    db.cleaningTaskCompletion.groupBy({
      by: ["status"],
      where: { task: { companyId }, dueDate: { gte: since } },
      _count: true,
    }),
  ]);

  const completed = completions.find((c) => c.status === "COMPLETED")?._count ?? 0;
  const missed = completions.find((c) => c.status === "MISSED")?._count ?? 0;
  const cleaningTotal = completed + missed;

  const parts: { ratio: number; weight: number }[] = [];
  if (tempTotal > 0) parts.push({ ratio: tempCompliant / tempTotal, weight: 0.6 });
  if (cleaningTotal > 0) parts.push({ ratio: completed / cleaningTotal, weight: 0.4 });

  let score: number | null = null;
  if (parts.length > 0) {
    const totalWeight = parts.reduce((sum, p) => sum + p.weight, 0);
    score = Math.round(
      (parts.reduce((sum, p) => sum + p.ratio * p.weight, 0) / totalWeight) * 100
    );
  }

  return {
    score,
    temperature: { compliant: tempCompliant, total: tempTotal },
    cleaning: { completed, total: cleaningTotal },
  };
}
