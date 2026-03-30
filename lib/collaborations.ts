import { createClient } from "@/lib/supabase/server";
import { CurrentProfile } from "@/lib/get-current-profile";
import { matchesDashboardFilters } from "@/lib/filtering";
import { DashboardFilters } from "@/lib/types";

export type CollaborationListItem = {
  id: string;
  industryName: string;
  thrustArea: string;
  departmentName: string;
  mouDate: string;
  isActive: boolean;
  internships: number;
  placements: number;
};

export type CollaborationDetailRecord = {
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
  csrFund: number;
  centresOfExcellence: number;
  innovationLabs: number;
  studentProjects: number;
  internships: number;
  placements: number;
};

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

function applyScope<T>(query: T, profile: CurrentProfile) {
  const scopedQuery = query as {
    eq: (column: string, value: string | number) => typeof query;
  };

  switch (profile.role) {
    case "department_coordinator":
      return profile.department_id ? scopedQuery.eq("department_id", profile.department_id) : query;
    case "institute_coordinator":
      return profile.institute_id ? scopedQuery.eq("institute_id", profile.institute_id) : query;
    case "campus_coordinator":
      return profile.campus_id ? scopedQuery.eq("campus_id", profile.campus_id) : query;
    default:
      return query;
  }
}

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function toDate(value: unknown) {
  if (!value) return "-";
  return String(value);
}

function formatHierarchyLabel(name?: string | null, code?: string | null, fallback = "Unknown") {
  if (name && code && name !== code) {
    return `${name} (${code})`;
  }

  return name ?? code ?? fallback;
}

export async function listCollaborationsForProfile(
  profile: CurrentProfile,
  filters: DashboardFilters = {}
): Promise<CollaborationListItem[]> {
  if (!hasRequiredScopedAssignment(profile)) {
    return [];
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("collaborations")
      .select("id, department_id, industry_id, thrust_area, mou_date, is_active, internships, placements, departments(id, name, code)")
      .order("mou_date", { ascending: false });

    query = applyScope(query, profile);

    const { data: collaborations, error } = await query;

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

    if (error || !collaborations) {
      console.error("Failed to load collaboration list", error);
      throw error;
    }

    const industryIds = [...new Set(collaborations.map((item) => item.industry_id).filter(Boolean))];
    const departmentIds = [...new Set(collaborations.map((item) => item.department_id).filter(Boolean))];

    const [industriesResult, departmentsResult] = await Promise.all([
      industryIds.length
        ? supabase.from("industries").select("id, name").in("id", industryIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string; code?: string | null }>, error: null }),
      departmentIds.length
        ? supabase.from("departments").select("id, name, code").in("id", departmentIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string; code?: string | null }>, error: null })
    ]);

    if (industriesResult.error) {
      console.error("Failed to load industries for collaboration list", industriesResult.error);
    }

    if (departmentsResult.error) {
      console.error("Failed to load departments for collaboration list", departmentsResult.error);
    }

    const industryMap = new Map((industriesResult.data ?? []).map((item) => [String(item.id), item.name]));
    const departmentMap = new Map((departmentsResult.data ?? []).map((item) => [String(item.id), formatHierarchyLabel(item.name, item.code, "Department")]));

    return collaborations
      .map((item) => {
        const departmentRelation = Array.isArray(item.departments) ? item.departments[0] : item.departments;

        return {
          id: String(item.id),
          industryName: industryMap.get(String(item.industry_id)) ?? "Unknown industry",
          thrustArea: item.thrust_area ?? "-",
          departmentName: departmentMap.get(String(item.department_id)) ?? formatHierarchyLabel(departmentRelation?.name, departmentRelation?.code, "Department"),
          mouDate: toDate(item.mou_date),
          isActive: Boolean(item.is_active),
          internships: toNumber(item.internships),
          placements: toNumber(item.placements)
        };
      })
      .filter((item) => matchesDashboardFilters(item, filters));
  } catch (error) {
    console.error("Unexpected failure while loading collaboration list", error);
    return [];
  }
}

export async function getCollaborationDetailForProfile(profile: CurrentProfile, id: string) {
  if (!id || !hasRequiredScopedAssignment(profile)) {
    return null;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("collaborations")
      .select("*")
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    query = applyScope(query, profile);

    const { data: collaboration, error } = await query;
    if (error || !collaboration) {
      if (error) {
        console.error(`Failed to load collaboration detail for ${id}`, error);
      }
      return null;
    }

    const [
      industryResult,
      universityResult,
      campusResult,
      instituteResult,
      departmentResult,
      facultyResult,
      studentResult,
      consultancyResult,
      grantsResult
    ] = await Promise.all([
      supabase.from("industries").select("id, name").eq("id", collaboration.industry_id).maybeSingle(),
      supabase.from("universities").select("id, name").eq("id", collaboration.university_id).maybeSingle(),
      supabase.from("campuses").select("id, name").eq("id", collaboration.campus_id).maybeSingle(),
      supabase.from("institutes").select("id, name").eq("id", collaboration.institute_id).maybeSingle(),
      supabase.from("departments").select("id, name").eq("id", collaboration.department_id).maybeSingle(),
      supabase.from("faculty_stats").select("*").eq("collaboration_id", collaboration.id).maybeSingle(),
      supabase.from("student_stats").select("*").eq("collaboration_id", collaboration.id).maybeSingle(),
      supabase.from("consultancy_projects").select("project_title, amount").eq("collaboration_id", collaboration.id),
      supabase.from("research_grants").select("project_title, funding_agency, amount").eq("collaboration_id", collaboration.id)
    ]);

    if (industryResult.error) {
      console.error(`Failed to load industry for collaboration ${id}`, industryResult.error);
    }
    if (universityResult.error) {
      console.error(`Failed to load university for collaboration ${id}`, universityResult.error);
    }
    if (campusResult.error) {
      console.error(`Failed to load campus for collaboration ${id}`, campusResult.error);
    }
    if (instituteResult.error) {
      console.error(`Failed to load institute for collaboration ${id}`, instituteResult.error);
    }
    if (departmentResult.error) {
      console.error(`Failed to load department for collaboration ${id}`, departmentResult.error);
    }
    if (facultyResult.error) {
      console.error(`Failed to load faculty stats for collaboration ${id}`, facultyResult.error);
    }
    if (studentResult.error) {
      console.error(`Failed to load student stats for collaboration ${id}`, studentResult.error);
    }
    if (consultancyResult.error) {
      console.error(`Failed to load consultancy projects for collaboration ${id}`, consultancyResult.error);
    }
    if (grantsResult.error) {
      console.error(`Failed to load research grants for collaboration ${id}`, grantsResult.error);
    }

    return {
      id: String(collaboration.id),
      universityId: String(collaboration.university_id ?? "-"),
      universityName: universityResult.data?.name ?? String(collaboration.university_id ?? "Unknown university"),
      campusId: String(collaboration.campus_id ?? "-"),
      campusName: campusResult.data?.name ?? String(collaboration.campus_id ?? "Unknown campus"),
      instituteId: String(collaboration.institute_id ?? "-"),
      instituteName: instituteResult.data?.name ?? String(collaboration.institute_id ?? "Unknown institute"),
      departmentId: String(collaboration.department_id ?? "-"),
      departmentName: departmentResult.data?.name ?? String(collaboration.department_id ?? "Unknown department"),
      industryId: String(collaboration.industry_id ?? "-"),
      industryName: industryResult.data?.name ?? collaboration.industry_name_snapshot ?? "Unknown industry",
      thrustArea: collaboration.thrust_area ?? "-",
      mouDate: toDate(collaboration.mou_date),
      durationMonths: toNumber(collaboration.duration_months),
      isActive: Boolean(collaboration.is_active),
      newCourses: toNumber(collaboration.new_courses),
      caseStudies: toNumber(collaboration.case_studies),
      partialDelivery: toNumber(collaboration.partial_delivery),
      academicActivities: toNumber(collaboration.academic_activities),
      faculty: {
        trainings: toNumber(facultyResult.data?.trainings),
        seminars: toNumber(facultyResult.data?.seminars),
        workshops: toNumber(facultyResult.data?.workshops),
        conferences: toNumber(facultyResult.data?.conferences)
      },
      students: {
        trainings: toNumber(studentResult.data?.trainings),
        seminars: toNumber(studentResult.data?.seminars),
        workshops: toNumber(studentResult.data?.workshops),
        conferences: toNumber(studentResult.data?.conferences)
      },
      consultancyProjects: (consultancyResult.data ?? []).map((item) => ({
        title: item.project_title,
        amount: toNumber(item.amount)
      })),
      researchGrants: (grantsResult.data ?? []).map((item) => ({
        title: item.project_title,
        fundingAgency: item.funding_agency,
        amount: toNumber(item.amount)
      })),
      csrFund: toNumber(collaboration.csr_fund),
      centresOfExcellence: toNumber(collaboration.centres_of_excellence),
      innovationLabs: toNumber(collaboration.innovation_labs),
      studentProjects: toNumber(collaboration.student_projects),
      internships: toNumber(collaboration.internships),
      placements: toNumber(collaboration.placements)
    } satisfies CollaborationDetailRecord;
  } catch (error) {
    console.error(`Unexpected failure while loading collaboration detail for ${id}`, error);
    return null;
  }
}



