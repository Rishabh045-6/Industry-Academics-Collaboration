import Link from "next/link";
import { Building2, Home, LogOut, PlusCircle } from "lucide-react";
import { ReactNode } from "react";
import { RoleKey } from "@/lib/types";
import { roleLabels } from "@/lib/rbac";
import { ALL_ROLES, hasRole, ROLES } from "@/lib/roles";

const links: Array<{
  href: string;
  label: string;
  icon: typeof Home;
  allowedRoles: RoleKey[];
}> = [
  { href: "/dashboard", label: "Dashboard", icon: Home, allowedRoles: ALL_ROLES },
  { href: "/collaborations", label: "Collaborations", icon: Building2, allowedRoles: ALL_ROLES },
  {
    href: "/collaborations/new",
    label: "Add Collaboration",
    icon: PlusCircle,
    allowedRoles: [ROLES.DEPARTMENT_COORDINATOR]
  }
];

export function AppShell({
  role,
  title,
  children
}: {
  role: RoleKey;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="panel flex flex-col justify-between p-6">
          <div>
            <p className="eyebrow text-blue-600">Governance dashboard</p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">Industry Academia Collaboration</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              One source of truth at department level, with progressive visibility for Institute Coordinators,
              Campus Coordinators, University Coordinators, and the Vice Chancellor.
            </p>
            <div className="mt-6 rounded-3xl bg-slate-900 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Signed in as</p>
              <p className="mt-2 text-lg font-semibold">{roleLabels[role]}</p>
            </div>
            <nav className="mt-6 space-y-2">
              {links
                .filter((link) => hasRole(role, link.allowedRoles))
                .map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                      href={link.href}
                    >
                      <Icon className="h-4 w-4 text-blue-600" />
                      {link.label}
                    </Link>
                  );
                })}
            </nav>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              Logout
            </Link>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            {title} is scoped automatically by role, with drill-down from leadership summary to campus,
            institute, department, and record level.
          </p>
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}

