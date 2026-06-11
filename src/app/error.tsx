"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Root error boundary: replaces Next's bare error screen with a readable
 * message and a pointer to /api/health, which diagnoses configuration
 * problems (database unreachable, schema not migrated, missing secrets).
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The server hit an unexpected error. If this is a fresh deployment, it
          is most likely a configuration issue — open{" "}
          <a href="/api/health" className="font-medium text-brand-700 underline dark:text-brand-400">
            /api/health
          </a>{" "}
          to see exactly what is missing.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Error reference: <code>{error.digest}</code>
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
