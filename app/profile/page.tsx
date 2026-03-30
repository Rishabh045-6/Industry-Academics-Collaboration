import { AppShell } from "@/components/app-shell";
import { roleConfig, roleLabels } from "@/lib/rbac";
import { requireRole } from "@/lib/require-role";
import { ALL_ROLES } from "@/lib/roles";

export default async function ProfilePage() {
  const profile = await requireRole(ALL_ROLES);
  const role = profile.role;
  const permissions = roleConfig[role];

  return (
    <AppShell role={role} title="Profile">
      <section className="panel p-6">
        <p className="eyebrow">Role profile</p>
        <h2 className="mt-2 text-3xl font-semibold">{roleLabels[role]}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl bg-surf p-4">
            <p className="eyebrow">Scope</p>
            <p className="mt-2 text-lg font-semibold capitalize">{permissions.scope}</p>
          </div>
          <div className="rounded-2xl bg-surf p-4">
            <p className="eyebrow">Execution access</p>
            <p className="mt-2 text-lg font-semibold">
              {permissions.canCreate || permissions.canEdit || permissions.canDelete ? "Operational" : "Review only"}
            </p>
          </div>
          <div className="rounded-2xl bg-surf p-4">
            <p className="eyebrow">Analytics reach</p>
            <p className="mt-2 text-lg font-semibold">{permissions.canSeeGlobal ? "University-wide" : "Scoped"}</p>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600">
          This page reflects the current governance mapping: Department Coordinators handle execution, Institute
          Coordinators and Campus Coordinators review scoped performance, University Coordinators oversee field-level visibility, and the
          Vice Chancellor receives summary-first oversight.
        </p>
      </section>
    </AppShell>
  );
}

