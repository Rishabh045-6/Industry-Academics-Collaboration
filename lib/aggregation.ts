
import { createClient } from "@/lib/supabase/server";
import { CurrentProfile } from "@/lib/get-current-profile";
import { matchesDashboardFilters } from "@/lib/filtering";
import {
  DashboardFilters,
  DashboardHierarchy,
  DashboardInsight,
  DrilldownRow,
  FieldDomain,
  HierarchyLevel,
  HierarchyOption,
  KpiMetric
} from "@/lib/types";

type ChartPoint = { name: string; value: number };
type ComparisonPoint = { name: string; value: number };
type ActivityPoint = { name: string; faculty: number; students: number };
type TrendPoint = { month: string; mous: number; grants: number; consultancy: number };
type PerformerPoint = { name: string; score: number };

type ChartMeta = {
  summaryTitle: string;
  summaryDescription: string;
  activeStatusTitle: string;
  thrustAreaTitle: string;
  comparisonTitle: string;
  comparisonAxisLabel: string;
  activityTitle: string;
  trendsTitle: string;
  performersTitle: string;
  topIndustriesTitle: string;
};

type EnrichedCollaboration = {
  id: string;
  universityId: string | null;
  universityName: string;
  campusId: string;
  campusName: string;
  campusCode: string;
  instituteId: string;
  instituteName: string;
  instituteCode: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  fieldDomain: FieldDomain;
  industryId: string;
  industryName: string;
  thrustArea: string;
  mouDate: string;
  durationMonths: number;
  isActive: boolean;
  newCourses: number;
  caseStudies: number;
  partialDelivery: number;
  academicActivities: number;
  consultancyCount: number;
  consultancyAmount: number;
  researchGrantCount: number;
  researchGrantAmount: number;
  csrFund: number;
  centresOfExcellence: number;
  innovationLabs: number;
  studentProjects: number;
  internships: number;
  placements: number;
  faculty: {
    trainings: number;
    seminars: number;
    workshops: number;
    conferences: number;
  };
  students: {
    trainings: number;
    seminars: number;
    workshops: number;
    conferences: number;
  };
  consultancyProjects: Array<{ title: string; amount: number }>;
  researchGrants: Array<{ title: string; fundingAgency: string; amount: number }>;
};

export type DashboardData = {
  hierarchy: DashboardHierarchy;
  chartMeta: ChartMeta;
  kpis: KpiMetric[];
  insights: DashboardInsight[];
  charts: {
    activeStatus: ChartPoint[];
    thrustArea: ChartPoint[];
    comparison: ComparisonPoint[];
    activity: ActivityPoint[];
    trends: TrendPoint[];
    performers: PerformerPoint[];
  };
  topIndustries: ChartPoint[];
  drilldown: DrilldownRow[];
  records: EnrichedCollaboration[];
};

const FIELD_DOMAINS: FieldDomain[] = [
  "Health Sciences",
  "Technical, Management and Humanities",
  "Grants & Consultancy"
];

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function toDate(value: unknown) {
  return value ? String(value) : "-";
}

function formatCurrency(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function formatPercent(value: number, total: number) {
  if (!total) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

function hasRequiredScopedAssignment(profile: CurrentProfile) {
  switch (profile.role) {
    case "department_coordinator":
      return Boolean(profile.department_id);
    case "institute_coordinator":
      return Boolean(profile.institute_id);
    case "campus_coordinator":
      return Boolean(profile.campus_id);
    default:
      return true;
  }
}

function scopedQuery<T>(query: T, profile: CurrentProfile) {
  const q = query as {
    eq: (column: string, value: string) => typeof query;
  };

  switch (profile.role) {
    case "department_coordinator":
      return q.eq("department_id", profile.department_id as string);
    case "institute_coordinator":
      return q.eq("institute_id", profile.institute_id as string);
    case "campus_coordinator":
      return q.eq("campus_id", profile.campus_id as string);
    default:
      return query;
  }
}

function classifyFieldDomain(params: {
  instituteName: string;
  instituteCode: string;
  departmentName: string;
  departmentCode: string;
  thrustArea: string;
}) {
  const text = [
    params.instituteName,
    params.instituteCode,
    params.departmentName,
    params.departmentCode,
    params.thrustArea
  ]
    .join(" ")
    .toLowerCase();

  if (
    ["health", "public health", "medical", "nursing", "pharma", "clinical", "diagnostic", "biotech"].some((token) =>
      text.includes(token)
    )
  ) {
    return "Health Sciences" satisfies FieldDomain;
  }

  if (
    ["management", "mba", "leadership", "business", "consultancy", "grant", "finance", "commerce"].some((token) =>
      text.includes(token)
    )
  ) {
    return "Grants & Consultancy" satisfies FieldDomain;
  }

  return "Technical, Management and Humanities" satisfies FieldDomain;
}

function uniqueOptions(
  records: EnrichedCollaboration[],
  getId: (record: EnrichedCollaboration) => string,
  getLabel: (record: EnrichedCollaboration) => string
) {
  const map = new Map<string, string>();

  records.forEach((record) => {
    const id = getId(record);
    if (!id || id === "-") {
      return;
    }

    if (!map.has(id)) {
      map.set(id, getLabel(record));
    }
  });

  return Array.from(map.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function sanitizeOption(options: HierarchyOption[], selected?: string) {
  if (!selected) {
    return undefined;
  }

  return options.some((option) => option.id === selected) ? selected : undefined;
}

function sanitizeField(selected: DashboardFilters["field"], options: FieldDomain[]) {
  return selected && options.includes(selected) ? selected : undefined;
}

function normalizeScopeId(value: string | number | null | undefined) {
  return value == null ? undefined : String(value);
}

function formatHierarchyLabel(name?: string | null, code?: string | null, fallback = "Unknown") {
  if (name && code && name !== code) {
    return `${name} (${code})`;
  }

  return name ?? code ?? fallback;
}

async function getScopedCollaborations(
  profile: CurrentProfile,
  filters: DashboardFilters = {}
): Promise<EnrichedCollaboration[]> {
  if (!hasRequiredScopedAssignment(profile)) {
    return [];
  }

  try {
    const supabase = await createClient();
  let collaborationQuery = supabase
    .from("collaborations")
    .select(
      "id, university_id, campus_id, institute_id, department_id, industry_id, industry_name_snapshot, thrust_area, mou_date, duration_months, academic_activities, is_active, new_courses, case_studies, partial_delivery, consultancy_count, consultancy_total_amount, research_grant_count, research_grant_total_amount, csr_fund, centres_of_excellence, innovation_labs, student_projects, internships, placements, universities(id, name, code), campuses(id, name, code), institutes(id, name, code), departments(id, name, code)"
    )
    .order("mou_date", { ascending: false });

  collaborationQuery = scopedQuery(collaborationQuery, profile);

  const { data: collaborations, error } = await collaborationQuery;

  console.log("=== DEBUG QUERY ===");
  console.log("Role:", profile.role);
  console.log("Scope:", {
    campus_id: profile.campus_id,
    institute_id: profile.institute_id,
    department_id: profile.department_id
  });
  console.log("Error:", error);
  console.log("Result count:", collaborations?.length);
  console.log("==================");

  if (error || !collaborations || collaborations.length === 0) {
    if (error) {
      console.error("Failed to load dashboard collaborations", error);
      throw error;
    }
    return [];
  }

  const collaborationIds = collaborations.map((item) => item.id);
  const universityIds = [...new Set(collaborations.map((item) => item.university_id).filter(Boolean))];
  const campusIds = [...new Set(collaborations.map((item) => item.campus_id).filter(Boolean))];
  const instituteIds = [...new Set(collaborations.map((item) => item.institute_id).filter(Boolean))];
  const departmentIds = [...new Set(collaborations.map((item) => item.department_id).filter(Boolean))];
  const industryIds = [...new Set(collaborations.map((item) => item.industry_id).filter(Boolean))];

  const [universitiesRes, campusesRes, institutesRes, departmentsRes, industriesRes, facultyRes, studentRes, consultancyRes, grantsRes] =
    await Promise.all([
      universityIds.length
        ? supabase.from("universities").select("id, name, code").in("id", universityIds)
        : Promise.resolve({ data: [] }),
      campusIds.length
        ? supabase.from("campuses").select("id, name, code").in("id", campusIds)
        : Promise.resolve({ data: [] }),
      instituteIds.length
        ? supabase.from("institutes").select("id, name, code").in("id", instituteIds)
        : Promise.resolve({ data: [] }),
      departmentIds.length
        ? supabase.from("departments").select("id, name, code").in("id", departmentIds)
        : Promise.resolve({ data: [] }),
      industryIds.length
        ? supabase.from("industries").select("id, name").in("id", industryIds)
        : Promise.resolve({ data: [] }),
      collaborationIds.length
        ? supabase.from("faculty_stats").select("collaboration_id, trainings, seminars, workshops, conferences").in("collaboration_id", collaborationIds)
        : Promise.resolve({ data: [] }),
      collaborationIds.length
        ? supabase.from("student_stats").select("collaboration_id, trainings, seminars, workshops, conferences").in("collaboration_id", collaborationIds)
        : Promise.resolve({ data: [] }),
      collaborationIds.length
        ? supabase.from("consultancy_projects").select("collaboration_id, project_title, amount").in("collaboration_id", collaborationIds)
        : Promise.resolve({ data: [] }),
      collaborationIds.length
        ? supabase.from("research_grants").select("collaboration_id, project_title, funding_agency, amount").in("collaboration_id", collaborationIds)
        : Promise.resolve({ data: [] })
    ]);

  const universityMap = new Map((universitiesRes.data ?? []).map((item) => [String(item.id), item]));
  const campusMap = new Map((campusesRes.data ?? []).map((item) => [String(item.id), item]));
  const instituteMap = new Map((institutesRes.data ?? []).map((item) => [String(item.id), item]));
  const departmentMap = new Map((departmentsRes.data ?? []).map((item) => [String(item.id), item]));
  const industryMap = new Map((industriesRes.data ?? []).map((item) => [String(item.id), item.name]));
  const facultyMap = new Map((facultyRes.data ?? []).map((item) => [String(item.collaboration_id), item]));
  const studentMap = new Map((studentRes.data ?? []).map((item) => [String(item.collaboration_id), item]));
  const consultancyMap = new Map<string, Array<{ collaboration_id: string; project_title: string; amount: number }>>();
  (consultancyRes.data ?? []).forEach((item) => {
    const key = String(item.collaboration_id);
    const list = consultancyMap.get(key) ?? [];
    list.push({ collaboration_id: key, project_title: item.project_title, amount: Number(item.amount) });
    consultancyMap.set(key, list);
  });
  const grantsMap = new Map<string, Array<{ collaboration_id: string; project_title: string; funding_agency: string; amount: number }>>();
  (grantsRes.data ?? []).forEach((item) => {
    const key = String(item.collaboration_id);
    const list = grantsMap.get(key) ?? [];
    list.push({ collaboration_id: key, project_title: item.project_title, funding_agency: item.funding_agency ?? "", amount: Number(item.amount) });
    grantsMap.set(key, list);
  });

  return collaborations
    .map((item) => {
      const faculty = facultyMap.get(String(item.id));
      const students = studentMap.get(String(item.id));
      const universityRelation = Array.isArray(item.universities) ? item.universities[0] : item.universities;
      const campusRelation = Array.isArray(item.campuses) ? item.campuses[0] : item.campuses;
      const instituteRelation = Array.isArray(item.institutes) ? item.institutes[0] : item.institutes;
      const departmentRelation = Array.isArray(item.departments) ? item.departments[0] : item.departments;
      const university = universityMap.get(String(item.university_id)) ?? universityRelation;
      const campus = campusMap.get(String(item.campus_id)) ?? campusRelation;
      const institute = instituteMap.get(String(item.institute_id)) ?? instituteRelation;
      const department = departmentMap.get(String(item.department_id)) ?? departmentRelation;

      return {
        id: String(item.id),
        universityId: item.university_id ? String(item.university_id) : null,
        universityName: formatHierarchyLabel(university?.name, university?.code, "University"),
        campusId: String(item.campus_id ?? "-"),
        campusName: formatHierarchyLabel(campus?.name, campus?.code, "Campus"),
        campusCode: campus?.code ?? "-",
        instituteId: String(item.institute_id ?? "-"),
        instituteName: formatHierarchyLabel(institute?.name, institute?.code, "Institute"),
        instituteCode: institute?.code ?? "-",
        departmentId: String(item.department_id ?? "-"),
        departmentName: formatHierarchyLabel(department?.name, department?.code, "Department"),
        departmentCode: department?.code ?? "-",
        fieldDomain: classifyFieldDomain({
          instituteName: institute?.name ?? "",
          instituteCode: institute?.code ?? "",
          departmentName: department?.name ?? "",
          departmentCode: department?.code ?? "",
          thrustArea: item.thrust_area ?? ""
        }),
        industryId: String(item.industry_id ?? "-"),
        industryName: industryMap.get(String(item.industry_id)) ?? item.industry_name_snapshot ?? "Unknown industry",
        thrustArea: item.thrust_area ?? "-",
        mouDate: toDate(item.mou_date),
        durationMonths: toNumber(item.duration_months),
        isActive: Boolean(item.is_active),
        newCourses: toNumber(item.new_courses),
        caseStudies: toNumber(item.case_studies),
        partialDelivery: toNumber(item.partial_delivery),
        academicActivities: toNumber(item.academic_activities),
        consultancyCount: toNumber(item.consultancy_count),
        consultancyAmount: toNumber(item.consultancy_total_amount),
        researchGrantCount: toNumber(item.research_grant_count),
        researchGrantAmount: toNumber(item.research_grant_total_amount),
        csrFund: toNumber(item.csr_fund),
        centresOfExcellence: toNumber(item.centres_of_excellence),
        innovationLabs: toNumber(item.innovation_labs),
        studentProjects: toNumber(item.student_projects),
        internships: toNumber(item.internships),
        placements: toNumber(item.placements),
        faculty: {
          trainings: toNumber(faculty?.trainings),
          seminars: toNumber(faculty?.seminars),
          workshops: toNumber(faculty?.workshops),
          conferences: toNumber(faculty?.conferences)
        },
        students: {
          trainings: toNumber(students?.trainings),
          seminars: toNumber(students?.seminars),
          workshops: toNumber(students?.workshops),
          conferences: toNumber(students?.conferences)
        },
        consultancyProjects: (consultancyMap.get(String(item.id)) ?? []).map((project) => ({
          title: project.project_title,
          amount: project.amount
        })),
        researchGrants: (grantsMap.get(String(item.id)) ?? []).map((grant) => ({
          title: grant.project_title,
          fundingAgency: grant.funding_agency,
          amount: grant.amount
        }))
      } satisfies EnrichedCollaboration;
    })
    .filter((item) => matchesDashboardFilters(item, filters));
  } catch (error) {
    console.error("Unexpected failure while loading dashboard collaboration data", error);
    return [];
  }
}

function summarize(records: EnrichedCollaboration[]) {
  const activeCount = records.filter((item) => item.isActive).length;
  const inactiveCount = records.length - activeCount;
  const industries = new Set(records.map((item) => item.industryId)).size;
  const newCourses = records.reduce((sum, item) => sum + item.newCourses, 0);
  const caseStudies = records.reduce((sum, item) => sum + item.caseStudies, 0);
  const partialDelivery = records.reduce((sum, item) => sum + item.partialDelivery, 0);
  const consultancyCount = records.reduce((sum, item) => sum + item.consultancyCount, 0);
  const consultancyAmount = records.reduce((sum, item) => sum + item.consultancyAmount, 0);
  const researchGrantCount = records.reduce((sum, item) => sum + item.researchGrantCount, 0);
  const researchGrantAmount = records.reduce((sum, item) => sum + item.researchGrantAmount, 0);
  const csrFund = records.reduce((sum, item) => sum + item.csrFund, 0);
  const centresOfExcellence = records.reduce((sum, item) => sum + item.centresOfExcellence, 0);
  const innovationLabs = records.reduce((sum, item) => sum + item.innovationLabs, 0);
  const studentProjects = records.reduce((sum, item) => sum + item.studentProjects, 0);
  const internships = records.reduce((sum, item) => sum + item.internships, 0);
  const placements = records.reduce((sum, item) => sum + item.placements, 0);

  return {
    activeCount,
    inactiveCount,
    industries,
    newCourses,
    caseStudies,
    partialDelivery,
    consultancyCount,
    consultancyAmount,
    researchGrantCount,
    researchGrantAmount,
    csrFund,
    centresOfExcellence,
    innovationLabs,
    studentProjects,
    internships,
    placements
  };
}

function getRoleBaseLabel(profile: CurrentProfile, records: EnrichedCollaboration[]) {
  switch (profile.role) {
    case "department_coordinator":
      return records[0]?.departmentName ?? "Department";
    case "institute_coordinator":
      return records[0]?.instituteName ?? "Institute";
    case "campus_coordinator":
      return records[0]?.campusName ?? "Campus";
    default:
      return records[0]?.universityName ?? "University";
  }
}

function buildHierarchy(records: EnrichedCollaboration[], profile: CurrentProfile, filters: DashboardFilters) {
  const isUniversityRole =
    profile.role === "deputy_director" || profile.role === "vice_chancellor" || profile.role === "corporate_relations_director" || profile.role === "admin";

  const fieldOptions = FIELD_DOMAINS.filter((field) => records.some((record) => record.fieldDomain === field));

  const selectedField = isUniversityRole ? sanitizeField(filters.field, fieldOptions) : undefined;
  const fieldScopedRecords = selectedField ? records.filter((record) => record.fieldDomain === selectedField) : records;

  const campusOptions = isUniversityRole
    ? uniqueOptions(fieldScopedRecords, (record) => record.campusId, (record) => record.campusName)
    : profile.role === "campus_coordinator"
      ? uniqueOptions(records, (record) => record.campusId, (record) => record.campusName)
      : [];

  const selectedCampusId =
    profile.role === "campus_coordinator"
      ? normalizeScopeId(profile.campus_id)
      : isUniversityRole && selectedField
        ? sanitizeOption(campusOptions, filters.campusId)
        : undefined;

  const campusScopedRecords = selectedCampusId
    ? fieldScopedRecords.filter((record) => record.campusId === selectedCampusId)
    : fieldScopedRecords;

  const instituteOptions =
    profile.role === "institute_coordinator"
      ? uniqueOptions(records, (record) => record.instituteId, (record) => record.instituteName)
      : profile.role === "campus_coordinator"
        ? uniqueOptions(campusScopedRecords, (record) => record.instituteId, (record) => record.instituteName)
        : isUniversityRole
          ? uniqueOptions(campusScopedRecords, (record) => record.instituteId, (record) => record.instituteName)
          : [];

  const selectedInstituteId =
    profile.role === "institute_coordinator"
      ? normalizeScopeId(profile.institute_id)
      : profile.role === "campus_coordinator" || isUniversityRole
        ? sanitizeOption(instituteOptions, filters.instituteId)
        : undefined;

  const instituteScopedRecords = selectedInstituteId
    ? campusScopedRecords.filter((record) => record.instituteId === selectedInstituteId)
    : campusScopedRecords;

  const departmentOptions =
    profile.role === "department_coordinator"
      ? uniqueOptions(records, (record) => record.departmentId, (record) => record.departmentName)
      : profile.role === "institute_coordinator"
        ? uniqueOptions(instituteScopedRecords, (record) => record.departmentId, (record) => record.departmentName)
        : selectedInstituteId
          ? uniqueOptions(instituteScopedRecords, (record) => record.departmentId, (record) => record.departmentName)
          : [];

  const selectedDepartmentId =
    profile.role === "department_coordinator"
      ? normalizeScopeId(profile.department_id)
      : profile.role === "institute_coordinator" || profile.role === "campus_coordinator" || isUniversityRole
        ? sanitizeOption(departmentOptions, filters.departmentId)
        : undefined;

  const scopedRecords = selectedDepartmentId
    ? instituteScopedRecords.filter((record) => record.departmentId === selectedDepartmentId)
    : instituteScopedRecords;

  const scopeLevel: HierarchyLevel = selectedDepartmentId
    ? "department"
    : selectedInstituteId
      ? "institute"
      : selectedCampusId
        ? "campus"
        : selectedField
          ? "field"
          : "university";

  const scopeLabel =
    scopeLevel === "department"
      ? departmentOptions.find((option) => option.id === selectedDepartmentId)?.label ?? getRoleBaseLabel(profile, records)
      : scopeLevel === "institute"
        ? instituteOptions.find((option) => option.id === selectedInstituteId)?.label ?? getRoleBaseLabel(profile, records)
        : scopeLevel === "campus"
          ? campusOptions.find((option) => option.id === selectedCampusId)?.label ?? getRoleBaseLabel(profile, records)
          : scopeLevel === "field"
            ? selectedField ?? getRoleBaseLabel(profile, records)
            : records[0]?.universityName ?? getRoleBaseLabel(profile, records);

  const scopePath = [
    selectedField,
    selectedCampusId ? campusOptions.find((option) => option.id === selectedCampusId)?.label : undefined,
    selectedInstituteId ? instituteOptions.find((option) => option.id === selectedInstituteId)?.label : undefined,
    selectedDepartmentId ? departmentOptions.find((option) => option.id === selectedDepartmentId)?.label : undefined
  ].filter((value): value is string => Boolean(value));

  return {
    records: scopedRecords,
    hierarchy: {
      scopeLevel,
      scopeLabel,
      scopePath,
      fieldOptions,
      campusOptions,
      instituteOptions,
      departmentOptions
    } satisfies DashboardHierarchy
  };
}

function groupMetric(
  records: EnrichedCollaboration[],
  getLabel: (record: EnrichedCollaboration) => string,
  getValue: (record: EnrichedCollaboration) => number
) {
  const totals = new Map<string, number>();

  records.forEach((record) => {
    const label = getLabel(record) || "Unknown";
    totals.set(label, (totals.get(label) ?? 0) + getValue(record));
  });

  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

function groupScore(records: EnrichedCollaboration[], getLabel: (record: EnrichedCollaboration) => string) {
  const scores = new Map<string, number>();

  records.forEach((record) => {
    const label = getLabel(record) || "Unknown";
    scores.set(label, (scores.get(label) ?? 0) + record.internships + record.placements);
  });

  return Array.from(scores.entries())
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 5);
}

function getGroupingAccessor(scopeLevel: HierarchyLevel) {
  if (scopeLevel === "department") {
    return (record: EnrichedCollaboration) => record.industryName;
  }

  if (scopeLevel === "institute") {
    return (record: EnrichedCollaboration) => record.departmentName;
  }

  if (scopeLevel === "campus") {
    return (record: EnrichedCollaboration) => record.instituteName;
  }

  return (record: EnrichedCollaboration) => record.campusName;
}

function getTopNames(
  items: Array<{ name: string } & Partial<Record<"value" | "collaborations" | "score", number>>>,
  valueKey: "value" | "collaborations" | "score"
) {
  if (items.length === 0) {
    return "";
  }

  const topValue = items[0][valueKey];
  return items
    .filter((item) => item[valueKey] === topValue)
    .map((item) => item.name)
    .sort((a, b) => a.localeCompare(b))
    .join(" / ");
}

function getChartMeta(scopeLevel: HierarchyLevel, scopeLabel: string): ChartMeta {
  switch (scopeLevel) {
    case "field":
      return {
        summaryTitle: `${scopeLabel} summary`,
        summaryDescription: "Field-level KPIs and charts are now limited to the selected domain before any campus or institute drill-down.",
        activeStatusTitle: `Active vs inactive in ${scopeLabel}`,
        thrustAreaTitle: `Thrust areas in ${scopeLabel}`,
        comparisonTitle: `Campus funding comparison in ${scopeLabel}`,
        comparisonAxisLabel: "Campuses",
        activityTitle: `Faculty vs student activities in ${scopeLabel}`,
        trendsTitle: `Trends in ${scopeLabel}`,
        performersTitle: `Top campuses in ${scopeLabel}`,
        topIndustriesTitle: `Top industries in ${scopeLabel}`
      };
    case "campus":
      return {
        summaryTitle: `${scopeLabel} summary`,
        summaryDescription: "Campus metrics are aggregated only from institutes and departments inside the selected campus.",
        activeStatusTitle: `Active vs inactive in ${scopeLabel}`,
        thrustAreaTitle: `Thrust areas in ${scopeLabel}`,
        comparisonTitle: `Institute funding comparison in ${scopeLabel}`,
        comparisonAxisLabel: "Institutes",
        activityTitle: `Faculty vs student activities in ${scopeLabel}`,
        trendsTitle: `Trends in ${scopeLabel}`,
        performersTitle: `Top institutes in ${scopeLabel}`,
        topIndustriesTitle: `Top industries in ${scopeLabel}`
      };
    case "institute":
      return {
        summaryTitle: `${scopeLabel} summary`,
        summaryDescription: "Institute metrics are aggregated only from departments within the selected institute.",
        activeStatusTitle: `Active vs inactive in ${scopeLabel}`,
        thrustAreaTitle: `Thrust areas in ${scopeLabel}`,
        comparisonTitle: `Department funding comparison in ${scopeLabel}`,
        comparisonAxisLabel: "Departments",
        activityTitle: `Faculty vs student activities in ${scopeLabel}`,
        trendsTitle: `Trends in ${scopeLabel}`,
        performersTitle: `Top departments in ${scopeLabel}`,
        topIndustriesTitle: `Top industries in ${scopeLabel}`
      };
    case "department":
      return {
        summaryTitle: `${scopeLabel} summary`,
        summaryDescription: "Department metrics stay inside the assigned department, with no cross-unit comparison outside that scope.",
        activeStatusTitle: `Active vs inactive in ${scopeLabel}`,
        thrustAreaTitle: `Thrust areas in ${scopeLabel}`,
        comparisonTitle: `Industry funding comparison in ${scopeLabel}`,
        comparisonAxisLabel: "Industries",
        activityTitle: `Faculty vs student activities in ${scopeLabel}`,
        trendsTitle: `Department trends in ${scopeLabel}`,
        performersTitle: `Industry outcomes in ${scopeLabel}`,
        topIndustriesTitle: `Department industries in ${scopeLabel}`
      };
    default:
      return {
        summaryTitle: `${scopeLabel} summary`,
        summaryDescription: "University-wide metrics stay at the top until a field, campus, institute, or department is explicitly selected.",
        activeStatusTitle: `Active vs inactive across ${scopeLabel}`,
        thrustAreaTitle: `Thrust areas across ${scopeLabel}`,
        comparisonTitle: "Campus funding comparison",
        comparisonAxisLabel: "Campuses",
        activityTitle: "Overall faculty vs student activities",
        trendsTitle: `Trends across ${scopeLabel}`,
        performersTitle: "Top campuses by outcomes",
        topIndustriesTitle: `Top industries across ${scopeLabel}`
      };
  }
}

function buildInsights(params: {
  hierarchy: DashboardHierarchy;
  records: EnrichedCollaboration[];
  totals: ReturnType<typeof summarize>;
}) {
  const { hierarchy, records, totals } = params;
  const groupingAccessor = getGroupingAccessor(hierarchy.scopeLevel);
  const internshipsLeaders = groupMetric(records, groupingAccessor, (record) => record.internships);
  const placementsLeaders = groupMetric(records, groupingAccessor, (record) => record.placements);
  const internshipsLeader = internshipsLeaders[0];
  const placementsLeader = placementsLeaders[0];

  const internshipsNames = getTopNames(internshipsLeaders, "value");
  const placementsNames = getTopNames(placementsLeaders, "value");

  const insights: DashboardInsight[] = [];

  if (internshipsLeader) {
    insights.push({
      title: "Strongest internships",
      value: internshipsNames,
      helper: `${internshipsLeader.value} internships contributed.`
    });
  }

  if (placementsLeader) {
    insights.push({
      title: "Strongest placements",
      value: placementsNames,
      helper: `${placementsLeader.value} placements contributed.`
    });
  }

  if (records.length > 0) {
    insights.push({
      title: "Collaboration health",
      value: totals.activeCount >= totals.inactiveCount ? "Mostly active" : "Mixed activity",
      helper: `${totals.activeCount} active and ${totals.inactiveCount} inactive records (${formatPercent(totals.activeCount, records.length)} active).`
    });
  }

  return insights.slice(0, 4);
}

export async function getDashboardData(
  profile: CurrentProfile,
  filters: DashboardFilters = {}
): Promise<DashboardData> {
  const allScopedRecords = await getScopedCollaborations(profile, filters);
  const { records, hierarchy } = buildHierarchy(allScopedRecords, profile, filters);
  const totals = summarize(records);
  const chartMeta = getChartMeta(hierarchy.scopeLevel, hierarchy.scopeLabel);

  const activeStatus: ChartPoint[] = [
    { name: "Active", value: totals.activeCount },
    { name: "Inactive", value: totals.inactiveCount }
  ];

  const thrustMap = new Map<string, number>();
  records.forEach((item) => {
    thrustMap.set(item.thrustArea, (thrustMap.get(item.thrustArea) ?? 0) + 1);
  });
  const thrustArea = Array.from(thrustMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));

  const comparison =
    hierarchy.scopeLevel === "department"
      ? groupMetric(records, (record) => record.industryName, (record) => record.consultancyAmount + record.researchGrantAmount)
      : hierarchy.scopeLevel === "institute"
        ? groupMetric(records, (record) => record.departmentName, (record) => record.consultancyAmount + record.researchGrantAmount)
        : hierarchy.scopeLevel === "campus"
          ? groupMetric(records, (record) => record.instituteName, (record) => record.consultancyAmount + record.researchGrantAmount)
          : groupMetric(records, (record) => record.campusName, (record) => record.consultancyAmount + record.researchGrantAmount);

  const activity: ActivityPoint[] = [
    {
      name: "Trainings",
      faculty: records.reduce((sum, item) => sum + item.faculty.trainings, 0),
      students: records.reduce((sum, item) => sum + item.students.trainings, 0)
    },
    {
      name: "Seminars",
      faculty: records.reduce((sum, item) => sum + item.faculty.seminars, 0),
      students: records.reduce((sum, item) => sum + item.students.seminars, 0)
    },
    {
      name: "Workshops",
      faculty: records.reduce((sum, item) => sum + item.faculty.workshops, 0),
      students: records.reduce((sum, item) => sum + item.students.workshops, 0)
    },
    {
      name: "Conferences",
      faculty: records.reduce((sum, item) => sum + item.faculty.conferences, 0),
      students: records.reduce((sum, item) => sum + item.students.conferences, 0)
    }
  ];

  const toHalfYearBucket = (month: string) => {
    const [year, monthPart] = month.split("-");
    const monthNumber = Number(monthPart);
    if (!year || Number.isNaN(monthNumber)) {
      return month;
    }
    return `${year}-${monthNumber <= 6 ? "H1" : "H2"}`;
  };

  const trendMap = new Map<string, TrendPoint>();
  records.forEach((item) => {
    const rawMonth = item.mouDate === "-" ? "Unknown" : item.mouDate.slice(0, 7);
    const month = rawMonth === "Unknown" ? "Unknown" : toHalfYearBucket(rawMonth);
    const current = trendMap.get(month) ?? { month, mous: 0, grants: 0, consultancy: 0 };
    current.mous += 1;
    current.grants += item.researchGrantAmount;
    current.consultancy += item.consultancyAmount;
    trendMap.set(month, current);
  });
  const trends = Array.from(trendMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  const performers =
    hierarchy.scopeLevel === "department"
      ? groupScore(records, (record) => record.industryName)
      : hierarchy.scopeLevel === "institute"
        ? groupScore(records, (record) => record.departmentName)
        : hierarchy.scopeLevel === "campus"
          ? groupScore(records, (record) => record.instituteName)
          : groupScore(records, (record) => record.campusName);

  const industryMap = new Map<string, number>();
  records.forEach((item) => {
    industryMap.set(item.industryName, (industryMap.get(item.industryName) ?? 0) + 1);
  });
  const topIndustries = Array.from(industryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, 5);

  const insights = buildInsights({
    hierarchy,
    records,
    totals
  });

  const fundedCollaborations = records.filter((item) => item.consultancyAmount > 0 || item.researchGrantAmount > 0).length;
  const totalFunding = totals.consultancyAmount + totals.researchGrantAmount;
  const averageFundingPerCollaboration = records.length ? Math.round(totalFunding / records.length) : 0;
  const internshipsInsight = insights.find((item) => item.title === "Strongest internships");
  const placementsInsight = insights.find((item) => item.title === "Strongest placements");
  const comparisonLeaderNames = getTopNames(comparison, "value");
  const topIndustryNames = getTopNames(topIndustries, "value");

  const kpis: KpiMetric[] = [
    {
      label: "Total collaborations",
      value: String(records.length),
      helper: "All collaboration records in the current hierarchy scope.",
      insight: comparisonLeaderNames
        ? `${comparisonLeaderNames} currently ${comparisonLeaderNames.includes(" / ") ? "lead" : "leads"} this view.`
        : undefined
    },
    {
      label: "Active collaborations",
      value: String(totals.activeCount),
      helper: "Currently active MoUs inside the selected scope.",
      insight: `${formatPercent(totals.activeCount, records.length)} of current records are active.`
    },
    { label: "Inactive collaborations", value: String(totals.inactiveCount), helper: "Closed or inactive MoUs inside the selected scope." },
    {
      label: "Total industries",
      value: String(totals.industries),
      helper: "Unique industry partners in the selected scope.",
      insight: topIndustryNames
        ? `${topIndustryNames} currently ${topIndustryNames.includes(" / ") ? "are" : "is"} the top partner${topIndustryNames.includes(" / ") ? "s" : ""} right now.`
        : undefined
    },
    {
      label: "Consultancy amount",
      value: formatCurrency(totals.consultancyAmount),
      helper: "Total consultancy value in the selected scope."
    },
    {
      label: "Research grant amount",
      value: formatCurrency(totals.researchGrantAmount),
      helper: "Total research grant value in the selected scope."
    },
    {
      label: "Funded collaborations",
      value: String(fundedCollaborations),
      helper: "Collaborations that include consultancy or research grant funding."
    },
    {
      label: "Average funding",
      value: formatCurrency(averageFundingPerCollaboration),
      helper: "Average combined grant and consultancy funding per collaboration."
    },
    {
      label: "Internships",
      value: String(totals.internships),
      helper: "Internship opportunities generated in this scope.",
      insight: internshipsInsight ? `${internshipsInsight.value} contributes the most internships.` : undefined
    },
    {
      label: "Placements",
      value: String(totals.placements),
      helper: "Placements supported by collaboration in this scope.",
      insight: placementsInsight ? `${placementsInsight.value} contributes the most placements.` : undefined
    }
  ];

  const drilldown: DrilldownRow[] = records.map((item) => ({
    scopeId: item.id,
    scopeName: `${item.departmentName} / ${item.industryName}`,
    level: "department",
    universityId: item.universityId ?? "-",
    campusId: item.campusId,
    instituteId: item.instituteId,
    departmentId: item.departmentId,
    universityName: item.universityName,
    campusName: item.campusName,
    instituteName: item.instituteName,
    departmentName: item.departmentName,
    industryName: item.industryName,
    thrustArea: item.thrustArea,
    status: item.isActive ? "Active" : "Inactive",
    mouDate: item.mouDate,
    internships: item.internships,
    placements: item.placements
  }));

  return {
    hierarchy,
    chartMeta,
    kpis,
    insights,
    charts: {
      activeStatus,
      thrustArea,
      comparison,
      activity,
      trends,
      performers
    },
    topIndustries,
    drilldown,
    records
  };
}
