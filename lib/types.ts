export type RoleKey =
  | "department_coordinator"
  | "institute_coordinator"
  | "campus_coordinator"
  | "deputy_director"
  | "vice_chancellor"
  | "corporate_relations_director"
  | "admin";

export type ScopeLevel = "department" | "institute" | "campus" | "university";
export type HierarchyLevel = ScopeLevel | "field";
export type FieldDomain = "Health Sciences" | "Technical, Management and Humanities";

export type ActivityBlock = {
  trainings: number;
  seminars: number;
  workshops: number;
  conferences: number;
};

export type MonetaryProject = {
  title: string;
  amount: number;
  fundingAgency?: string;
};

export type CollaborationRecord = {
  id: string;
  universityId: string;
  universityName: string;
  campusId: string;
  campusName: string;
  instituteId: string;
  instituteName: string;
  departmentId: string;
  departmentName: string;
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
  faculty: ActivityBlock;
  students: ActivityBlock;
  consultancyProjects: MonetaryProject[];
  researchGrants: MonetaryProject[];
  csrFund: number;
  centresOfExcellence: number;
  innovationLabs: number;
  studentProjects: number;
  internships: number;
  placements: number;
};

export type DashboardFilters = {
  active?: "all" | "active" | "inactive";
  fromDate?: string;
  toDate?: string;
  industry?: string;
  thrustArea?: string;
  field?: FieldDomain;
  campusId?: string;
  instituteId?: string;
  departmentId?: string;
};

export type KpiMetric = {
  label: string;
  value: string;
  helper: string;
  insight?: string;
};

export type DashboardInsight = {
  title: string;
  value: string;
  helper: string;
};

export type DrilldownRow = {
  scopeId: string;
  scopeName: string;
  level: ScopeLevel;
  universityId: string;
  campusId: string;
  instituteId: string;
  departmentId: string;
  universityName: string;
  campusName: string;
  instituteName: string;
  departmentName: string;
  industryName: string;
  thrustArea: string;
  status: string;
  mouDate: string;
  internships: number;
  placements: number;
};

export type HierarchyOption = {
  id: string;
  label: string;
};

export type DashboardHierarchy = {
  scopeLevel: HierarchyLevel;
  scopeLabel: string;
  scopePath: string[];
  fieldOptions: FieldDomain[];
  campusOptions: HierarchyOption[];
  instituteOptions: HierarchyOption[];
  departmentOptions: HierarchyOption[];
};
