import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CollaborationForm } from "@/components/collaboration-form";
import { getCollaborationDetailForProfile } from "@/lib/collaborations";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { updateCollaboration } from "../actions";

function toConsultancyText(record: Awaited<ReturnType<typeof getCollaborationDetailForProfile>>) {
  if (!record) return "";
  return record.consultancyProjects.map((item) => `${item.title}|${item.amount}`).join("\n");
}

function toResearchGrantText(record: Awaited<ReturnType<typeof getCollaborationDetailForProfile>>) {
  if (!record) return "";
  return record.researchGrants.map((item) => `${item.title}|${item.fundingAgency}|${item.amount}`).join("\n");
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing_required_fields":
      return "Industry, thrust area, and MoU date are required.";
    case "collaboration_update_failed":
      return "The collaboration could not be updated. Please try again.";
    case "faculty_update_failed":
    case "student_update_failed":
    case "consultancy_update_failed":
    case "grant_update_failed":
      return "Part of the update could not be saved. Please review the record and try again.";
    default:
      return error ? decodeURIComponent(error) : undefined;
  }
}

export default async function EditCollaborationPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireRole([ROLES.DEPARTMENT_COORDINATOR, ROLES.ADMIN]);
  const { id } = await params;
  const { error } = await searchParams;
  const record = await getCollaborationDetailForProfile(profile, id);

  if (!record) {
    notFound();
  }

  const action = updateCollaboration.bind(null, id);

  return (
    <AppShell role={profile.role} title="Edit collaboration">
      <CollaborationForm
        action={action}
        error={getErrorMessage(error)}
        title="Edit collaboration entry"
        submitLabel="Update collaboration"
        initialValues={{
          industry_name: record.industryName,
          thrust_area: record.thrustArea,
          mou_date: record.mouDate,
          duration_months: record.durationMonths,
          is_active: record.isActive ? "yes" : "no",
          new_courses: record.newCourses,
          case_studies: record.caseStudies,
          partial_delivery: record.partialDelivery,
          academic_activities: record.academicActivities,
          faculty_trainings: record.faculty.trainings,
          faculty_seminars: record.faculty.seminars,
          faculty_workshops: record.faculty.workshops,
          faculty_conferences: record.faculty.conferences,
          student_trainings: record.students.trainings,
          student_seminars: record.students.seminars,
          student_workshops: record.students.workshops,
          student_conferences: record.students.conferences,
          csr_fund: record.csrFund,
          centres_of_excellence: record.centresOfExcellence,
          innovation_labs: record.innovationLabs,
          student_projects: record.studentProjects,
          internships: record.internships,
          placements: record.placements,
          consultancy_projects: toConsultancyText(record),
          research_grants: toResearchGrantText(record)
        }}
      />
    </AppShell>
  );
}
