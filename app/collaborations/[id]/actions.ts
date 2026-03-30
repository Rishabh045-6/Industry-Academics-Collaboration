"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readInt(formData: FormData, key: string) {
  const value = Number(readString(formData, key) || 0);
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function readFloat(formData: FormData, key: string) {
  const value = Number(readString(formData, key) || 0);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function normalizeAmount(value: string) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function parseConsultancyProjects(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, amount] = line.split("|").map((part) => part.trim());
      return {
        project_title: title,
        amount: normalizeAmount(amount || "0")
      };
    })
    .filter((item) => item.project_title);
}

function parseResearchGrants(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [project_title, funding_agency, amount] = line.split("|").map((part) => part.trim());
      return {
        project_title,
        funding_agency,
        amount: normalizeAmount(amount || "0")
      };
    })
    .filter((item) => item.project_title && item.funding_agency);
}

function applyScope<T>(query: T, profile: { role: string; department_id: string | null; institute_id: string | null; campus_id: string | null }) {
  const scopedQuery = query as {
    eq: (column: string, value: string) => typeof query;
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

async function findOrCreateIndustryId(supabase: Awaited<ReturnType<typeof createClient>>, industryName: string) {
  const { data: existingIndustry, error: existingIndustryError } = await supabase
    .from("industries")
    .select("id, name")
    .ilike("name", industryName)
    .maybeSingle();

  if (existingIndustryError) {
    console.error("Failed to look up industry during collaboration update", existingIndustryError);
    redirect(`/collaborations?error=${encodeURIComponent("industry_lookup_failed")}`);
  }

  if (existingIndustry) {
    return String(existingIndustry.id);
  }

  const { data: createdIndustry, error: industryError } = await supabase
    .from("industries")
    .insert({ name: industryName })
    .select("id")
    .single();

  if (industryError || !createdIndustry) {
    console.error("Failed to create industry during collaboration update", industryError);
    redirect(`/collaborations?error=${encodeURIComponent("industry_create_failed")}`);
  }

  return String(createdIndustry.id);
}

export async function updateCollaboration(id: string, formData: FormData): Promise<void> {
  const profile = await requireRole([ROLES.DEPARTMENT_COORDINATOR, ROLES.ADMIN]);
  const supabase = await createClient();

  const industryName = readString(formData, "industry_name");
  const thrustArea = readString(formData, "thrust_area");
  const mouDate = readString(formData, "mou_date");

  if (!industryName || !thrustArea || !mouDate) {
    redirect(`/collaborations/${id}/edit?error=missing_required_fields`);
  }

  let existingQuery = supabase
    .from("collaborations")
    .select("id, university_id, campus_id, institute_id, department_id")
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  existingQuery = applyScope(existingQuery, profile);

  const { data: existingCollaboration, error: existingError } = await existingQuery;

  if (existingError || !existingCollaboration) {
    if (existingError) {
      console.error(`Failed to load collaboration ${id} for update`, existingError);
    }
    redirect("/collaborations?error=unauthorized");
  }

  const industryId = await findOrCreateIndustryId(supabase, industryName);
  const consultancyProjects = parseConsultancyProjects(readString(formData, "consultancy_projects"));
  const researchGrants = parseResearchGrants(readString(formData, "research_grants"));

  const { error: collaborationError } = await supabase
    .from("collaborations")
    .update({
      university_id: existingCollaboration.university_id,
      campus_id: existingCollaboration.campus_id,
      institute_id: existingCollaboration.institute_id,
      department_id: existingCollaboration.department_id,
      industry_id: industryId,
      industry_name_snapshot: industryName,
      thrust_area: thrustArea,
      mou_date: mouDate,
      duration_months: readInt(formData, "duration_months"),
      is_active: readString(formData, "is_active") === "yes",
      new_courses: readInt(formData, "new_courses"),
      case_studies: readInt(formData, "case_studies"),
      partial_delivery: readInt(formData, "partial_delivery"),
      academic_activities: readInt(formData, "academic_activities"),
      consultancy_count: consultancyProjects.length,
      consultancy_total_amount: consultancyProjects.reduce((sum, item) => sum + item.amount, 0),
      research_grant_count: researchGrants.length,
      research_grant_total_amount: researchGrants.reduce((sum, item) => sum + item.amount, 0),
      csr_fund: readFloat(formData, "csr_fund"),
      centres_of_excellence: readInt(formData, "centres_of_excellence"),
      innovation_labs: readInt(formData, "innovation_labs"),
      student_projects: readInt(formData, "student_projects"),
      internships: readInt(formData, "internships"),
      placements: readInt(formData, "placements")
    })
    .eq("id", id);

  if (collaborationError) {
    console.error(`Failed to update collaboration ${id}`, collaborationError);
    redirect(`/collaborations/${id}/edit?error=collaboration_update_failed`);
  }

  const { error: facultyDeleteError } = await supabase.from("faculty_stats").delete().eq("collaboration_id", id);
  if (facultyDeleteError) {
    console.error(`Failed to clear faculty stats for collaboration ${id}`, facultyDeleteError);
    redirect(`/collaborations/${id}/edit?error=faculty_update_failed`);
  }

  const { error: facultyError } = await supabase.from("faculty_stats").insert({
    collaboration_id: id,
    trainings: readInt(formData, "faculty_trainings"),
    seminars: readInt(formData, "faculty_seminars"),
    workshops: readInt(formData, "faculty_workshops"),
    conferences: readInt(formData, "faculty_conferences")
  });

  if (facultyError) {
    console.error(`Failed to save faculty stats for collaboration ${id}`, facultyError);
    redirect(`/collaborations/${id}/edit?error=faculty_update_failed`);
  }

  const { error: studentDeleteError } = await supabase.from("student_stats").delete().eq("collaboration_id", id);
  if (studentDeleteError) {
    console.error(`Failed to clear student stats for collaboration ${id}`, studentDeleteError);
    redirect(`/collaborations/${id}/edit?error=student_update_failed`);
  }

  const { error: studentError } = await supabase.from("student_stats").insert({
    collaboration_id: id,
    trainings: readInt(formData, "student_trainings"),
    seminars: readInt(formData, "student_seminars"),
    workshops: readInt(formData, "student_workshops"),
    conferences: readInt(formData, "student_conferences")
  });

  if (studentError) {
    console.error(`Failed to save student stats for collaboration ${id}`, studentError);
    redirect(`/collaborations/${id}/edit?error=student_update_failed`);
  }

  const { error: consultancyDeleteError } = await supabase.from("consultancy_projects").delete().eq("collaboration_id", id);
  if (consultancyDeleteError) {
    console.error(`Failed to clear consultancy projects for collaboration ${id}`, consultancyDeleteError);
    redirect(`/collaborations/${id}/edit?error=consultancy_update_failed`);
  }

  if (consultancyProjects.length > 0) {
    const { error } = await supabase.from("consultancy_projects").insert(
      consultancyProjects.map((item) => ({
        collaboration_id: id,
        ...item
      }))
    );

    if (error) {
      console.error(`Failed to save consultancy projects for collaboration ${id}`, error);
      redirect(`/collaborations/${id}/edit?error=consultancy_update_failed`);
    }
  }

  const { error: grantsDeleteError } = await supabase.from("research_grants").delete().eq("collaboration_id", id);
  if (grantsDeleteError) {
    console.error(`Failed to clear research grants for collaboration ${id}`, grantsDeleteError);
    redirect(`/collaborations/${id}/edit?error=grant_update_failed`);
  }

  if (researchGrants.length > 0) {
    const { error } = await supabase.from("research_grants").insert(
      researchGrants.map((item) => ({
        collaboration_id: id,
        ...item
      }))
    );

    if (error) {
      console.error(`Failed to save research grants for collaboration ${id}`, error);
      redirect(`/collaborations/${id}/edit?error=grant_update_failed`);
    }
  }

  redirect(`/collaborations/${id}`);
}
