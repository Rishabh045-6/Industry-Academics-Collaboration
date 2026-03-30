import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCollaborationDetailForProfile } from "@/lib/collaborations";
import { requireRole } from "@/lib/require-role";
import { ALL_ROLES, ROLES } from "@/lib/roles";

export default async function CollaborationDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireRole(ALL_ROLES);
  const { id } = await params;
  const record = await getCollaborationDetailForProfile(profile, id);

  if (!record) {
    notFound();
  }

  const consultancyAmount = record.consultancyProjects.reduce((sum, item) => sum + item.amount, 0);
  const grantAmount = record.researchGrants.reduce((sum, item) => sum + item.amount, 0);
  const canEdit = profile.role === ROLES.DEPARTMENT_COORDINATOR || profile.role === ROLES.ADMIN;

  return (
    <AppShell role={profile.role} title="Collaboration detail">
      <section className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Record detail</p>
            <h2 className="mt-2 text-3xl font-semibold">{record.industryName}</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Drill-down path: {record.universityName} / {record.campusName} / {record.instituteName} / {record.departmentName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              href="/collaborations"
            >
              ← Back to collaborations
            </Link>
            {canEdit ? (
              <Link className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800" href={`/collaborations/${id}/edit`}>
                Edit collaboration
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="panel p-5 xl:col-span-2">
          <h3 className="text-xl font-semibold">Academic and operational summary</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="eyebrow">Basic</p>
              <p className="mt-2">Thrust area: {record.thrustArea}</p>
              <p>MoU date: {record.mouDate}</p>
              <p>Duration: {record.durationMonths} months</p>
              <p>Status: {record.isActive ? "Active" : "Inactive"}</p>
            </div>
            <div>
              <p className="eyebrow">Academic</p>
              <p className="mt-2">New courses: {record.newCourses}</p>
              <p>Case studies: {record.caseStudies}</p>
              <p>Partial delivery: {record.partialDelivery}</p>
              <p>Activities: {record.academicActivities}</p>
            </div>
            <div>
              <p className="eyebrow">Faculty</p>
              <p className="mt-2">Trainings: {record.faculty.trainings}</p>
              <p>Seminars: {record.faculty.seminars}</p>
              <p>Workshops: {record.faculty.workshops}</p>
              <p>Conferences: {record.faculty.conferences}</p>
            </div>
            <div>
              <p className="eyebrow">Students</p>
              <p className="mt-2">Trainings: {record.students.trainings}</p>
              <p>Seminars: {record.students.seminars}</p>
              <p>Workshops: {record.students.workshops}</p>
              <p>Conferences: {record.students.conferences}</p>
            </div>
          </div>
        </article>

        <article className="panel p-5">
          <h3 className="text-xl font-semibold">Financial rollup</h3>
          <p className="mt-4">Consultancy count: {record.consultancyProjects.length}</p>
          <p>Consultancy amount: Rs {consultancyAmount.toLocaleString("en-IN")}</p>
          <p className="mt-3">Research grants count: {record.researchGrants.length}</p>
          <p>Research grants amount: Rs {grantAmount.toLocaleString("en-IN")}</p>
          <p className="mt-3">CSR fund: Rs {record.csrFund.toLocaleString("en-IN")}</p>
          <p>CoEs: {record.centresOfExcellence}</p>
          <p>Innovation labs: {record.innovationLabs}</p>
          <p>Student projects: {record.studentProjects}</p>
          <p>Internships: {record.internships}</p>
          <p>Placements: {record.placements}</p>
        </article>
      </section>

      <section className="panel p-6">
        <h3 className="text-xl font-semibold">Project records</h3>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="eyebrow">Consultancy projects</p>
            <ul className="mt-3 space-y-3 text-sm">
              {record.consultancyProjects.length > 0 ? (
                record.consultancyProjects.map((item) => (
                  <li key={`${item.title}-${item.amount}`} className="rounded-2xl bg-surf px-4 py-3">
                    {item.title} - Rs {item.amount.toLocaleString("en-IN")}
                  </li>
                ))
              ) : (
                <li className="rounded-2xl bg-surf px-4 py-3 text-slate-500">No consultancy projects recorded.</li>
              )}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Research grants</p>
            <ul className="mt-3 space-y-3 text-sm">
              {record.researchGrants.length > 0 ? (
                record.researchGrants.map((item) => (
                  <li key={`${item.title}-${item.fundingAgency}-${item.amount}`} className="rounded-2xl bg-surf px-4 py-3">
                    {item.title} - {item.fundingAgency} - Rs {item.amount.toLocaleString("en-IN")}
                  </li>
                ))
              ) : (
                <li className="rounded-2xl bg-surf px-4 py-3 text-slate-500">No research grants recorded.</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <h3 className="text-xl font-semibold">Full submitted collaboration details</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Scope fields</p>
            <p className="text-sm text-slate-600">University: {record.universityId}</p>
            <p className="text-sm text-slate-600">Campus: {record.campusId}</p>
            <p className="text-sm text-slate-600">Institute: {record.instituteId}</p>
            <p className="text-sm text-slate-600">Department: {record.departmentId}</p>
          </div>
          <div className="space-y-2 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Partner details</p>
            <p className="text-sm text-slate-600">Industry: {record.industryName}</p>
            <p className="text-sm text-slate-600">Industry ID: {record.industryId}</p>
            <p className="text-sm text-slate-600">Thrust area: {record.thrustArea}</p>
            <p className="text-sm text-slate-600">MoU date: {record.mouDate}</p>
            <p className="text-sm text-slate-600">Duration: {record.durationMonths} months</p>
            <p className="text-sm text-slate-600">Active: {record.isActive ? "Yes" : "No"}</p>
          </div>
          <div className="space-y-2 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Academic engagement</p>
            <p className="text-sm text-slate-600">New courses: {record.newCourses}</p>
            <p className="text-sm text-slate-600">Case studies: {record.caseStudies}</p>
            <p className="text-sm text-slate-600">Partial delivery: {record.partialDelivery}</p>
            <p className="text-sm text-slate-600">Academic activity count: {record.academicActivities}</p>
          </div>
          <div className="space-y-2 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Faculty engagement</p>
            <p className="text-sm text-slate-600">Trainings: {record.faculty.trainings}</p>
            <p className="text-sm text-slate-600">Seminars: {record.faculty.seminars}</p>
            <p className="text-sm text-slate-600">Workshops: {record.faculty.workshops}</p>
            <p className="text-sm text-slate-600">Conferences: {record.faculty.conferences}</p>
          </div>
          <div className="space-y-2 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Student engagement</p>
            <p className="text-sm text-slate-600">Trainings: {record.students.trainings}</p>
            <p className="text-sm text-slate-600">Seminars: {record.students.seminars}</p>
            <p className="text-sm text-slate-600">Workshops: {record.students.workshops}</p>
            <p className="text-sm text-slate-600">Conferences: {record.students.conferences}</p>
          </div>
          <div className="space-y-2 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Additional outcomes</p>
            <p className="text-sm text-slate-600">CSR fund: Rs {record.csrFund.toLocaleString("en-IN")}</p>
            <p className="text-sm text-slate-600">Centres of excellence: {record.centresOfExcellence}</p>
            <p className="text-sm text-slate-600">Innovation labs: {record.innovationLabs}</p>
            <p className="text-sm text-slate-600">Student projects: {record.studentProjects}</p>
            <p className="text-sm text-slate-600">Internships: {record.internships}</p>
            <p className="text-sm text-slate-600">Placements: {record.placements}</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-800">Consultancy projects submitted</p>
          <ul className="mt-3 space-y-2 text-sm">
            {record.consultancyProjects.length > 0 ? (
              record.consultancyProjects.map((item) => (
                <li key={`${item.title}-${item.amount}`} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-semibold">{item.title}</span>: Rs {item.amount.toLocaleString("en-IN")}
                </li>
              ))
            ) : (
              <li className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-500">No consultancy projects submitted.</li>
            )}
          </ul>
        </div>
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-800">Research grants submitted</p>
          <ul className="mt-3 space-y-2 text-sm">
            {record.researchGrants.length > 0 ? (
              record.researchGrants.map((item) => (
                <li key={`${item.title}-${item.fundingAgency}-${item.amount}`} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-semibold">{item.title}</span> - {item.fundingAgency}: Rs {item.amount.toLocaleString("en-IN")}
                </li>
              ))
            ) : (
              <li className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-500">No research grants submitted.</li>
            )}
          </ul>
        </div>
        <Link className="mt-6 inline-block font-semibold text-ember" href="/collaborations">
          Back to collaboration list
        </Link>
      </section>
    </AppShell>
  );
}
