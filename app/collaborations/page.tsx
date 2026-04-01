import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DownloadPanel } from "@/components/download-panel";
import { FilterBar } from "@/components/filter-bar";
import { RecordTable } from "@/components/record-table";
import { parseDashboardFilters } from "@/lib/filtering";
import { listCollaborationsForProfile } from "@/lib/collaborations";
import { getDashboardData } from "@/lib/aggregation";
import { roleLabels } from "@/lib/rbac";
import { requireRole } from "@/lib/require-role";
import { ALL_ROLES, ROLES } from "@/lib/roles";

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

function getErrorMessage(error?: string) {
  switch (error) {
    case "unauthorized":
      return "You do not have access to that collaboration record.";
    default:
      return error ? decodeURIComponent(error) : undefined;
  }
}

export default async function CollaborationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await requireRole(ALL_ROLES);
  const role = profile.role;
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const filters = parseDashboardFilters(params);
  const rows = await listCollaborationsForProfile(profile, filters);
  const missingScope = !hasAssignedScope(profile);
  const dashboardData = missingScope ? null : await getDashboardData(profile, filters);
  const canCreate = role === ROLES.DEPARTMENT_COORDINATOR || role === ROLES.ADMIN;

  return (
    <AppShell role={role} title="Collaborations">
      <section className="panel flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{roleLabels[role]}</p>
          <h2 className="mt-2 text-3xl font-semibold">Collaboration records</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            All higher roles inherit visibility from department entries. Create and edit actions stay limited to
            Department Coordinators.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canCreate ? (
            <Link className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white" href="/collaborations/new">
              Add Collaboration
            </Link>
          ) : null}
        </div>
      </section>
      {error ? (
        <section className="panel border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          {getErrorMessage(error)}
        </section>
      ) : null}
      {missingScope ? (
        <section className="panel p-6">
          <p className="eyebrow text-blue-600">Scope required</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Your profile is missing an assigned scope</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            This role needs an assigned department, institute, or campus before collaboration records can be shown.
          </p>
        </section>
      ) : (
        <>
          {dashboardData ? <DownloadPanel role={role} data={dashboardData} /> : null}
          <FilterBar role={roleLabels[role]} filters={filters} resetHref="/collaborations" />
          <RecordTable rows={rows} />
        </>
      )}
    </AppShell>
  );
}
