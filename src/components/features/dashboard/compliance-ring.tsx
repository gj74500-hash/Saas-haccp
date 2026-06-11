import { cn } from "@/lib/utils";

/** SVG progress ring for the compliance score (0–100). */
export function ComplianceRing({ score }: { score: number | null }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const value = score ?? 0;
  const offset = circumference - (value / 100) * circumference;

  const tone =
    score === null
      ? "text-slate-300"
      : score >= 90
        ? "text-emerald-500"
        : score >= 70
          ? "text-amber-500"
          : "text-red-500";

  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-slate-100"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={score === null ? circumference : offset}
          className={cn("stroke-current transition-all duration-700", tone)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-semibold tracking-tight text-slate-900">
        {score === null ? "—" : score}
      </span>
    </div>
  );
}
