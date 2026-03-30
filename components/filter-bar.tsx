"use client";

import Link from "next/link";
import { DashboardFilters, DashboardHierarchy, RoleKey } from "@/lib/types";
import { ROLES } from "@/lib/roles";

type FilterBarProps = {
  role: string;
  roleKey?: RoleKey;
  filters: DashboardFilters;
  hierarchy?: DashboardHierarchy;
  resetHref: string;
};

function SelectField({
  name,
  defaultValue,
  options,
  placeholder,
  disabled = false,
  autoSubmit = false
}: {
  name: string;
  defaultValue?: string;
  options: Array<{ id: string; label: string }>;
  placeholder: string;
  disabled?: boolean;
  autoSubmit?: boolean;
}) {
  return (
    <select
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 disabled:cursor-not-allowed disabled:bg-slate-50"
      defaultValue={defaultValue ?? ""}
      disabled={disabled}
      name={name}
      onChange={autoSubmit ? (event) => event.currentTarget.form?.requestSubmit() : undefined}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function FilterBar({ role, roleKey, filters, hierarchy, resetHref }: FilterBarProps) {
  const currentRoleKey = roleKey ?? ROLES.ADMIN;
  const currentHierarchy =
    hierarchy ?? {
      scopeLevel: "university",
      scopeLabel: role,
      scopePath: [],
      fieldOptions: [],
      campusOptions: [],
      instituteOptions: [],
      departmentOptions: []
    };

  const isUniversityRole =
    currentRoleKey === ROLES.DEPUTY_DIRECTOR || currentRoleKey === ROLES.VICE_CHANCELLOR || currentRoleKey === ROLES.CORPORATE_RELATIONS_DIRECTOR || currentRoleKey === ROLES.ADMIN;
  const isCampusRole = currentRoleKey === ROLES.CAMPUS_COORDINATOR;
  const isInstituteRole = currentRoleKey === ROLES.INSTITUTE_COORDINATOR;
  const isViceChancellor =
    currentRoleKey === ROLES.VICE_CHANCELLOR || currentRoleKey === ROLES.CORPORATE_RELATIONS_DIRECTOR;
  const isUniversityCoordinator = currentRoleKey === ROLES.DEPUTY_DIRECTOR;

  const fieldOptions = currentHierarchy.fieldOptions.map((field) => ({ id: field, label: field }));
  const shouldAutoSubmitHierarchy = isViceChancellor || isUniversityCoordinator;

  return (
    <section className="panel p-5">
      <form className="flex flex-col gap-5" method="get">
        <div>
          <p className="eyebrow">Global filters</p>
          <h2 className="mt-2 text-2xl font-semibold">Progressive drill-down controls</h2>
        </div>

        {hierarchy && isUniversityRole ? (
          <div className={`grid gap-3 md:grid-cols-2 ${isUniversityCoordinator ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}>
            {!isUniversityCoordinator ? (
              <SelectField
                name="field"
                defaultValue={filters.field}
                options={fieldOptions}
                placeholder="All fields"
                autoSubmit={isViceChancellor}
              />
            ) : null}
            <SelectField
              name="campus"
              defaultValue={filters.campusId}
              options={currentHierarchy.campusOptions}
              placeholder={isUniversityCoordinator ? "All campuses" : filters.field ? "All campuses" : "Select field first"}
              disabled={!isUniversityCoordinator && !filters.field}
              autoSubmit={shouldAutoSubmitHierarchy}
            />
            <SelectField
              name="institute"
              defaultValue={filters.instituteId}
              options={currentHierarchy.instituteOptions}
              placeholder={filters.campusId ? "All institutes" : "Select campus first"}
              disabled={!filters.campusId}
              autoSubmit={shouldAutoSubmitHierarchy}
            />
            <SelectField
              name="department"
              defaultValue={filters.departmentId}
              options={currentHierarchy.departmentOptions}
              placeholder={filters.instituteId ? "All departments" : "Select institute first"}
              disabled={!filters.instituteId}
              autoSubmit={shouldAutoSubmitHierarchy}
            />
          </div>
        ) : null}

        {hierarchy && isCampusRole ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
            <SelectField
              name="institute"
              defaultValue={filters.instituteId}
              options={currentHierarchy.instituteOptions}
              placeholder="All institutes"
            />
            <SelectField
              name="department"
              defaultValue={filters.departmentId}
              options={currentHierarchy.departmentOptions}
              placeholder={filters.instituteId ? "All departments" : "Select institute first"}
              disabled={!filters.instituteId}
            />
          </div>
        ) : null}

        {hierarchy && isInstituteRole ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
            <SelectField
              name="department"
              defaultValue={filters.departmentId}
              options={currentHierarchy.departmentOptions}
              placeholder="All departments"
            />
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3" defaultValue={filters.active ?? "all"} name="active">
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            defaultValue={filters.industry ?? ""}
            name="industry"
            placeholder="Industry"
            type="text"
          />
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            defaultValue={filters.thrustArea ?? ""}
            name="thrust"
            placeholder="Thrust area"
            type="text"
          />
          <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3" defaultValue={filters.fromDate ?? ""} name="from" type="date" />
          <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3" defaultValue={filters.toDate ?? ""} name="to" type="date" />
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700" type="submit">
            Apply filters
          </button>
          <Link className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" href={resetHref}>
            Clear filters
          </Link>
        </div>

        <p className="text-sm leading-6 text-slate-600">
          Current scope: <span className="font-semibold text-ink">{role}</span>. Active path:{" "}
          <span className="font-semibold text-ink">{currentHierarchy.scopePath.length > 0 ? currentHierarchy.scopePath.join(" / ") : currentHierarchy.scopeLabel}</span>.
          Filters apply only inside the signed-in user's allowed scope.
        </p>
      </form>
    </section>
  );
}
