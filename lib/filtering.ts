import { DashboardFilters, FieldDomain } from "@/lib/types";

type SearchValue = string | string[] | undefined;

const FIELD_DOMAINS: FieldDomain[] = [
  "Health Sciences",
  "Technical, Management and Humanities",
  "Grants & Consultancy"
];

function first(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function clean(value: SearchValue) {
  return first(value)?.trim() ?? "";
}

export function parseDashboardFilters(
  searchParams: Record<string, SearchValue> | undefined
): DashboardFilters {
  const active = clean(searchParams?.active);
  const field = clean(searchParams?.field);

  return {
    active: active === "active" || active === "inactive" ? active : "all",
    fromDate: clean(searchParams?.from) || undefined,
    toDate: clean(searchParams?.to) || undefined,
    industry: clean(searchParams?.industry) || undefined,
    thrustArea: clean(searchParams?.thrust) || undefined,
    field: FIELD_DOMAINS.includes(field as FieldDomain) ? (field as FieldDomain) : undefined,
    campusId: clean(searchParams?.campus) || undefined,
    instituteId: clean(searchParams?.institute) || undefined,
    departmentId: clean(searchParams?.department) || undefined
  };
}

function matchesText(value: string, filter?: string) {
  if (!filter) return true;
  return value.toLowerCase().includes(filter.toLowerCase());
}

function matchesDate(value: string, fromDate?: string, toDate?: string) {
  if (!value || value === "-") return !fromDate && !toDate;

  const date = new Date(value).getTime();
  if (fromDate && date < new Date(fromDate).getTime()) return false;
  if (toDate && date > new Date(toDate).getTime()) return false;

  return true;
}

export function matchesDashboardFilters(
  item: {
    industryName: string;
    thrustArea: string;
    mouDate: string;
    isActive: boolean;
  },
  filters: DashboardFilters
) {
  const activeMatch =
    !filters.active ||
    filters.active === "all" ||
    (filters.active === "active" && item.isActive) ||
    (filters.active === "inactive" && !item.isActive);

  return (
    activeMatch &&
    matchesText(item.industryName, filters.industry) &&
    matchesText(item.thrustArea, filters.thrustArea) &&
    matchesDate(item.mouDate, filters.fromDate, filters.toDate)
  );
}
