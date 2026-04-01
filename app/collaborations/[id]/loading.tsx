import { AppShell } from "@/components/app-shell";

export default function Loading() {
  return (
    <AppShell role="department_coordinator" title="Loading collaboration">
      <section className="panel flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-ember" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-ember">Loading</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">Opening collaboration details</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
          We&apos;re fetching the full collaboration record, project details, and hierarchy path for you.
        </p>
      </section>
    </AppShell>
  );
}
