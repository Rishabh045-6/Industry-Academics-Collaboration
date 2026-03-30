"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

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

async function cleanupFailedCollaboration(supabase: Awaited<ReturnType<typeof createClient>>, collaborationId: string) {
  await Promise.allSettled([
    supabase.from("faculty_stats").delete().eq("collaboration_id", collaborationId),
    supabase.from("student_stats").delete().eq("collaboration_id", collaborationId),
    supabase.from("consultancy_projects").delete().eq("collaboration_id", collaborationId),
    supabase.from("research_grants").delete().eq("collaboration_id", collaborationId),
    supabase.from("collaborations").delete().eq("id", collaborationId)
  ]);
}

export async function createCollaboration(formData: FormData): Promise<void> {
  const profile = await requireRole([ROLES.DEPARTMENT_COORDINATOR, ROLES.ADMIN]);

  if (!profile.university_id || !profile.campus_id || !profile.institute_id || !profile.department_id) {
    redirect("/collaborations/new?error=missing_scope");
  }

  const supabase = await createClient();
  const industryName = readString(formData, "industry_name");
  const thrustArea = readString(formData, "thrust_area");
  const mouDate = readString(formData, "mou_date");

  if (!industryName || !thrustArea || !mouDate) {
    redirect("/collaborations/new?error=missing_required_fields");
  }

  const consultancyProjects = parseConsultancyProjects(readString(formData, "consultancy_projects"));
  const researchGrants = parseResearchGrants(readString(formData, "research_grants"));

  let industryId: string;
  const { data: existingIndustry, error: existingIndustryError } = await supabase
    .from("industries")
    .select("id, name")
    .ilike("name", industryName)
    .maybeSingle();

  if (existingIndustryError) {
    console.error("Failed to look up industry before creating collaboration", existingIndustryError);
    redirect("/collaborations/new?error=industry_lookup_failed");
  }

  if (existingIndustry) {
    industryId = String(existingIndustry.id);
  } else {
    const { data: createdIndustry, error: industryError } = await supabase
      .from("industries")
      .insert({ name: industryName })
      .select("id")
      .single();

    if (industryError || !createdIndustry) {
      console.error("Failed to create industry for collaboration", industryError);
      redirect("/collaborations/new?error=industry_create_failed");
    }

    industryId = String(createdIndustry.id);
  }

  const collaborationPayload = {
    university_id: profile.university_id,
    campus_id: profile.campus_id,
    institute_id: profile.institute_id,
    department_id: profile.department_id,
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
    placements: readInt(formData, "placements"),
    created_by: profile.id
  };

  const { data: collaboration, error: collaborationError } = await supabase
    .from("collaborations")
    .insert(collaborationPayload)
    .select("id")
    .single();

  if (collaborationError || !collaboration) {
    console.error("Failed to create collaboration", collaborationError);
    redirect("/collaborations/new?error=collaboration_create_failed");
  }

  const collaborationId = String(collaboration.id);

  const { error: facultyError } = await supabase.from("faculty_stats").insert({
    collaboration_id: collaborationId,
    trainings: readInt(formData, "faculty_trainings"),
    seminars: readInt(formData, "faculty_seminars"),
    workshops: readInt(formData, "faculty_workshops"),
    conferences: readInt(formData, "faculty_conferences")
  });

  if (facultyError) {
    console.error(`Failed to create faculty stats for collaboration ${collaborationId}`, facultyError);
    await cleanupFailedCollaboration(supabase, collaborationId);
    redirect("/collaborations/new?error=faculty_create_failed");
  }

  const { error: studentError } = await supabase.from("student_stats").insert({
    collaboration_id: collaborationId,
    trainings: readInt(formData, "student_trainings"),
    seminars: readInt(formData, "student_seminars"),
    workshops: readInt(formData, "student_workshops"),
    conferences: readInt(formData, "student_conferences")
  });

  if (studentError) {
    console.error(`Failed to create student stats for collaboration ${collaborationId}`, studentError);
    await cleanupFailedCollaboration(supabase, collaborationId);
    redirect("/collaborations/new?error=student_create_failed");
  }

  if (consultancyProjects.length > 0) {
    const { error } = await supabase.from("consultancy_projects").insert(
      consultancyProjects.map((item) => ({
        collaboration_id: collaborationId,
        ...item
      }))
    );

    if (error) {
      console.error(`Failed to create consultancy projects for collaboration ${collaborationId}`, error);
      await cleanupFailedCollaboration(supabase, collaborationId);
      redirect("/collaborations/new?error=consultancy_create_failed");
    }
  }

  if (researchGrants.length > 0) {
    const { error } = await supabase.from("research_grants").insert(
      researchGrants.map((item) => ({
        collaboration_id: collaborationId,
        ...item
      }))
    );

    if (error) {
      console.error(`Failed to create research grants for collaboration ${collaborationId}`, error);
      await cleanupFailedCollaboration(supabase, collaborationId);
      redirect("/collaborations/new?error=grant_create_failed");
    }
  }

  redirect(`/collaborations/${collaborationId}`);
}
