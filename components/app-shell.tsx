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
    <div className="min-h-screen bg-transparent p-5 md:p-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="sidebar-panel flex flex-col justify-between p-6 text-white">
          <div>
            <p className="eyebrow text-sky-200">Governance dashboard</p>
            <h1 className="mt-3 text-2xl font-semibold text-white">Industry Academia Collaboration</h1>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              One source of truth at department level, with progressive visibility for Institute Coordinators,
              Campus Coordinators, University Coordinators, and the Vice Chancellor.
            </p>
            <div className="mt-6 rounded-3xl bg-primary/90 p-5 text-white ring-1 ring-white/10">
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
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-secondary/10 hover:text-white"
                      href={link.href}
                    >
                      <Icon className="h-4 w-4 text-secondary" />
                      {link.label}
                    </Link>
                  );
                })}
            </nav>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl border border-[#93C5FD]/50 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
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

