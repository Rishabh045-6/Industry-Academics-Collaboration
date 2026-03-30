import { AppShell } from "@/components/app-shell";
import { CollaborationForm } from "@/components/collaboration-form";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { createCollaboration } from "./actions";

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing_scope":
      return "Your profile is missing scope values required to create a collaboration.";
    case "missing_required_fields":
      return "Industry, thrust area, and MoU date are required.";
    case "industry_lookup_failed":
    case "industry_create_failed":
      return "We could not prepare the industry record. Please try again.";
    case "collaboration_create_failed":
      return "The collaboration could not be saved. Please try again.";
    case "faculty_create_failed":
    case "student_create_failed":
    case "consultancy_create_failed":
    case "grant_create_failed":
      return "The collaboration could not be saved completely. No partial record was kept.";
    default:
      return error ? decodeURIComponent(error) : undefined;
  }
}

export default async function NewCollaborationPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireRole([ROLES.DEPARTMENT_COORDINATOR, ROLES.ADMIN]);
  const { error } = await searchParams;

  return (
    <AppShell role={profile.role} title="New collaboration">
      <section className="panel p-6">
        <p className="eyebrow">New collaboration</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Add department collaboration</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Use this page to enter a presentation-ready collaboration record with academic engagement, activity counts,
          consultancy work, research grants, and placement impact in one flow.
        </p>
      </section>
      <CollaborationForm action={createCollaboration} error={getErrorMessage(error)} />
    </AppShell>
  );
}
