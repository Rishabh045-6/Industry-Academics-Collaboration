import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="panel max-w-4xl p-10 md:p-12">
        <h1 className="text-5xl font-semibold leading-tight text-slate-900 md:text-6xl">
          Industry Academia Collaboration
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          Department Coordinators execute data entry once. Institute Coordinators, Campus Coordinators, University Coordinators, and the
          Vice Chancellor review progressively through scoped dashboards, filters, and analytics.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link className="primary-button" href="/login">
            Open login
          </Link>
          <Link className="secondary-button" href="/docs">
            View architecture
          </Link>
        </div>
      </div>
    </main>
  );
}
