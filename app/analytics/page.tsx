import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { KpiGrid } from "@/components/kpi-grid";
import { parseDashboardFilters } from "@/lib/filtering";
import { getDashboardData } from "@/lib/aggregation";
import { roleLabels } from "@/lib/rbac";
import { requireRole } from "@/lib/require-role";
import { DEMO_SCOPE_COOKIE, ROLES } from "@/lib/roles";
import { FieldDomain } from "@/lib/types";

const FIELD_DOMAINS: FieldDomain[] = [
  "Health Sciences",
  "Technical, Management and Humanities",
  "Grants & Consultancy"
];

function hasAssignedScope(profile: {
  role: string;
  department_id: string | null;
  institute_id: string | null;
  campus_id: string | null;
}) {
  switch (profile.role) {
    case ROLES.DEPARTMENT_COORDINATOR:
      return Boolean(profile.department_id);
    case ROLES.INSTITUTE_COORDINATOR:
      return Boolean(profile.institute_id);
    case ROLES.CAMPUS_COORDINATOR:
      return Boolean(profile.campus_id);
    default:
      return true;
  }
}

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await requireRole([
    ROLES.INSTITUTE_COORDINATOR,
    ROLES.CAMPUS_COORDINATOR,
    ROLES.DEPUTY_DIRECTOR,
    ROLES.VICE_CHANCELLOR,
    ROLES.CORPORATE_RELATIONS_DIRECTOR,
    ROLES.ADMIN
  ]);
  const role = profile.role;
  const filters = parseDashboardFilters(await searchParams);

  if (role === ROLES.DEPUTY_DIRECTOR && !filters.field) {
    const demoScope = (await cookies()).get(DEMO_SCOPE_COOKIE)?.value;
    if (demoScope && FIELD_DOMAINS.includes(demoScope as FieldDomain)) {
      filters.field = demoScope as FieldDomain;
    }
  }

  const missingScope = !hasAssignedScope(profile);
  const data = missingScope ? null : await getDashboardData(profile, filters);

  return (
    <AppShell role={role} title="Analytics">
      <section className="panel p-6">
        <p className="eyebrow">{roleLabels[role]}</p>
        <h2 className="mt-2 text-3xl font-semibold">Analytics summary</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          This page now shows only the key performance metrics for your current scope.
        </p>
      </section>
      {missingScope ? (
        <section className="panel p-6">
          <p className="eyebrow text-blue-600">Scope required</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Your profile is missing an assigned scope</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            This role needs an assigned institute or campus before analytics can be shown.
          </p>
        </section>
      ) : data ? (
        <KpiGrid items={data.kpis} />
      ) : null}
    </AppShell>
  );
}
