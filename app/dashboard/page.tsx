import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { ProgressiveDashboard } from "@/components/progressive-dashboard";
import { parseDashboardFilters } from "@/lib/filtering";
import { getDashboardData } from "@/lib/aggregation";
import { roleLabels } from "@/lib/rbac";
import { requireRole } from "@/lib/require-role";
import { ALL_ROLES, DEMO_SCOPE_COOKIE, ROLES } from "@/lib/roles";
import { FieldDomain } from "@/lib/types";

const FIELD_DOMAINS: FieldDomain[] = [
  "Health Sciences",
  "Technical, Management and Humanities"
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

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await requireRole(ALL_ROLES);
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
    <AppShell role={role} title="Dashboard">
      <section className="panel p-6">
        <p className="eyebrow">{roleLabels[role]}</p>
        <h2 className="mt-2 text-3xl font-semibold">Hierarchy-aligned dashboard</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Vice Chancellor and University Coordinator views begin at university summary, while institute, campus, and department roles stay pinned to their allowed scope.
        </p>
      </section>

      {missingScope ? (
        <section className="panel p-6">
          <p className="eyebrow text-blue-600">Scope required</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Your profile is missing an assigned scope</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            This role needs an assigned department, institute, or campus before dashboard data can be shown.
          </p>
        </section>
      ) : data ? (
        <>
          <FilterBar role={roleLabels[role]} roleKey={role} filters={filters} hierarchy={data.hierarchy} resetHref="/dashboard" />
          <ProgressiveDashboard role={role} data={data} includeTable={false} />
        </>
      ) : null}
    </AppShell>
  );
}
