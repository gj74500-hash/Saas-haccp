import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      {/* Brand panel — hidden on mobile */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-900 p-10 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #10b981 0%, transparent 45%), radial-gradient(circle at 80% 80%, #047857 0%, transparent 50%)",
          }}
        />
        <div className="relative">
          <Logo className="[&_span:last-child]:text-white" />
        </div>
        <div className="relative max-w-md space-y-4">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Food safety compliance, finally without the paperwork.
          </h1>
          <p className="text-brand-200">
            Temperature monitoring, cleaning schedules, HACCP records and audit
            trails — in one place, for every location.
          </p>
        </div>
        <p className="relative text-sm text-brand-300">
          Trusted by restaurants, hotels, cafés, bakeries and food producers.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
