"use client";

import { ReactNode, useState } from "react";
import { useFormStatus } from "react-dom";

export type CollaborationFormValues = {
  industry_name: string;
  thrust_area: string;
  mou_date: string;
  duration_months: number;
  is_active: "yes" | "no";
  new_courses: number;
  case_studies: number;
  partial_delivery: number;
  academic_activities: number;
  faculty_trainings: number;
  faculty_seminars: number;
  faculty_workshops: number;
  faculty_conferences: number;
  student_trainings: number;
  student_seminars: number;
  student_workshops: number;
  student_conferences: number;
  csr_fund: number;
  centres_of_excellence: number;
  innovation_labs: number;
  student_projects: number;
  internships: number;
  placements: number;
  consultancy_projects: string;
  research_grants: string;
};

type ConsultancyRow = {
  title: string;
  amount: string;
};

type ResearchGrantRow = {
  title: string;
  agency: string;
  amount: string;
};

const emptyValues: CollaborationFormValues = {
  industry_name: "",
  thrust_area: "",
  mou_date: "",
  duration_months: 0,
  is_active: "yes",
  new_courses: 0,
  case_studies: 0,
  partial_delivery: 0,
  academic_activities: 0,
  faculty_trainings: 0,
  faculty_seminars: 0,
  faculty_workshops: 0,
  faculty_conferences: 0,
  student_trainings: 0,
  student_seminars: 0,
  student_workshops: 0,
  student_conferences: 0,
  csr_fund: 0,
  centres_of_excellence: 0,
  innovation_labs: 0,
  student_projects: 0,
  internships: 0,
  placements: 0,
  consultancy_projects: "",
  research_grants: ""
};

function parseConsultancyRows(value: string) {
  const rows = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, amount] = line.split("|").map((part) => part.trim());
      return { title: title ?? "", amount: amount ?? "" };
    });

  return rows.length > 0 ? rows : [{ title: "", amount: "" }];
}

function parseResearchGrantRows(value: string) {
  const rows = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, agency, amount] = line.split("|").map((part) => part.trim());
      return { title: title ?? "", agency: agency ?? "", amount: amount ?? "" };
    });

  return rows.length > 0 ? rows : [{ title: "", agency: "", amount: "" }];
}

function serializeConsultancyRows(rows: ConsultancyRow[]) {
  return rows
    .map((row) => ({ title: row.title.trim(), amount: row.amount.trim() }))
    .filter((row) => row.title)
    .map((row) => `${row.title}|${row.amount || 0}`)
    .join("\n");
}

function serializeResearchGrantRows(rows: ResearchGrantRow[]) {
  return rows
    .map((row) => ({ title: row.title.trim(), agency: row.agency.trim(), amount: row.amount.trim() }))
    .filter((row) => row.title && row.agency)
    .map((row) => `${row.title}|${row.agency}|${row.amount || 0}`)
    .join("\n");
}

function Section({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70" disabled={pending} type="submit">
      {pending ? "Saving..." : label}
    </button>
  );
}

export function CollaborationForm({
  action,
  error,
  initialValues,
  title = "Create collaboration entry",
  submitLabel = "Save collaboration"
}: {
  action: (formData: FormData) => Promise<void>;
  error?: string;
  initialValues?: Partial<CollaborationFormValues>;
  title?: string;
  submitLabel?: string;
}) {
  const values = { ...emptyValues, ...initialValues };
  const [consultancyRows, setConsultancyRows] = useState<ConsultancyRow[]>(
    parseConsultancyRows(values.consultancy_projects)
  );
  const [researchGrantRows, setResearchGrantRows] = useState<ResearchGrantRow[]>(
    parseResearchGrantRows(values.research_grants)
  );

  const consultancyProjectsValue = serializeConsultancyRows(consultancyRows);
  const researchGrantsValue = serializeResearchGrantRows(researchGrantRows);

  return (
    <form action={action} className="space-y-6">
      <section className="panel p-6">
        <p className="eyebrow">Department coordinator form</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Capture one collaboration completely in a single pass, including academic impact, activity counts,
          consultancy work, research grants, and placement outcomes.
        </p>
        {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
      </section>

      <Section
        title="Basic collaboration details"
        description="Set the partner, thrust area, timeline, and overall engagement status."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Industry name">
            <input className={inputClassName} name="industry_name" placeholder="Google, Bosch, Infosys" required defaultValue={values.industry_name} />
          </Field>
          <Field label="Thrust area">
            <input className={inputClassName} name="thrust_area" placeholder="AI, VLSI, Industry 4.0, Cybersecurity" required defaultValue={values.thrust_area} />
          </Field>
          <Field label="MoU date">
            <input className={inputClassName} name="mou_date" type="date" required defaultValue={values.mou_date} />
          </Field>
          <Field label="MoU duration (months)">
            <input className={inputClassName} name="duration_months" type="number" min="0" placeholder="24" defaultValue={values.duration_months} />
          </Field>
          <Field label="Active collaboration">
            <select className={inputClassName} name="is_active" defaultValue={values.is_active}>
              <option value="yes">Yes, active</option>
              <option value="no">No, inactive</option>
            </select>
          </Field>
          <Field label="Activities count">
            <input className={inputClassName} name="academic_activities" type="number" min="0" placeholder="Overall activity count" defaultValue={values.academic_activities} />
          </Field>
        </div>
      </Section>

      <Section
        title="Academic engagement"
        description="Track curriculum-linked engagement generated through the collaboration."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="New courses">
            <input className={inputClassName} name="new_courses" type="number" min="0" placeholder="0" defaultValue={values.new_courses} />
          </Field>
          <Field label="Case studies">
            <input className={inputClassName} name="case_studies" type="number" min="0" placeholder="0" defaultValue={values.case_studies} />
          </Field>
          <Field label="Partial delivery instances">
            <input className={inputClassName} name="partial_delivery" type="number" min="0" placeholder="0" defaultValue={values.partial_delivery} />
          </Field>
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section
          title="Faculty engagement"
          description="Count the faculty-facing touchpoints completed through this industry relationship."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Training programs">
              <input className={inputClassName} name="faculty_trainings" type="number" min="0" placeholder="0" defaultValue={values.faculty_trainings} />
            </Field>
            <Field label="Seminars">
              <input className={inputClassName} name="faculty_seminars" type="number" min="0" placeholder="0" defaultValue={values.faculty_seminars} />
            </Field>
            <Field label="Workshops">
              <input className={inputClassName} name="faculty_workshops" type="number" min="0" placeholder="0" defaultValue={values.faculty_workshops} />
            </Field>
            <Field label="Conferences">
              <input className={inputClassName} name="faculty_conferences" type="number" min="0" placeholder="0" defaultValue={values.faculty_conferences} />
            </Field>
          </div>
        </Section>

        <Section
          title="Student engagement"
          description="Capture the student-facing events and training opportunities delivered."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Training programs">
              <input className={inputClassName} name="student_trainings" type="number" min="0" placeholder="0" defaultValue={values.student_trainings} />
            </Field>
            <Field label="Seminars">
              <input className={inputClassName} name="student_seminars" type="number" min="0" placeholder="0" defaultValue={values.student_seminars} />
            </Field>
            <Field label="Workshops">
              <input className={inputClassName} name="student_workshops" type="number" min="0" placeholder="0" defaultValue={values.student_workshops} />
            </Field>
            <Field label="Conferences">
              <input className={inputClassName} name="student_conferences" type="number" min="0" placeholder="0" defaultValue={values.student_conferences} />
            </Field>
          </div>
        </Section>
      </div>

      <Section
        title="Consultancy projects"
        description="Add one row per consultancy engagement. These rows are stored as project title and amount."
      >
        <div className="space-y-3">
          {consultancyRows.map((row, index) => (
            <div key={`consultancy-${index}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]">
              <Field label={`Project ${index + 1} title`}>
                <input
                  className={inputClassName}
                  placeholder="Industry-sponsored testing lab support"
                  value={row.title}
                  onChange={(event) => {
                    const nextRows = [...consultancyRows];
                    nextRows[index] = { ...nextRows[index], title: event.target.value };
                    setConsultancyRows(nextRows);
                  }}
                />
              </Field>
              <Field label="Amount">
                <input
                  className={inputClassName}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="250000"
                  value={row.amount}
                  onChange={(event) => {
                    const nextRows = [...consultancyRows];
                    nextRows[index] = { ...nextRows[index], amount: event.target.value };
                    setConsultancyRows(nextRows);
                  }}
                />
              </Field>
              <div className="flex items-end">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={consultancyRows.length === 1}
                  onClick={() => setConsultancyRows(consultancyRows.filter((_, rowIndex) => rowIndex !== index))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            onClick={() => setConsultancyRows([...consultancyRows, { title: "", amount: "" }])}
          >
            Add consultancy project
          </button>
          <p className="self-center text-sm text-slate-500">Rows with a title are included in the saved record.</p>
        </div>
      </Section>

      <Section
        title="Research grants"
        description="Add one row per grant with project title, funding agency, and amount."
      >
        <div className="space-y-3">
          {researchGrantRows.map((row, index) => (
            <div key={`grant-${index}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_220px_180px_auto]">
              <Field label={`Grant ${index + 1} title`}>
                <input
                  className={inputClassName}
                  placeholder="AI-enabled diagnostics grant"
                  value={row.title}
                  onChange={(event) => {
                    const nextRows = [...researchGrantRows];
                    nextRows[index] = { ...nextRows[index], title: event.target.value };
                    setResearchGrantRows(nextRows);
                  }}
                />
              </Field>
              <Field label="Funding agency">
                <input
                  className={inputClassName}
                  placeholder="DST, MeitY, Bosch CSR Foundation"
                  value={row.agency}
                  onChange={(event) => {
                    const nextRows = [...researchGrantRows];
                    nextRows[index] = { ...nextRows[index], agency: event.target.value };
                    setResearchGrantRows(nextRows);
                  }}
                />
              </Field>
              <Field label="Amount">
                <input
                  className={inputClassName}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="800000"
                  value={row.amount}
                  onChange={(event) => {
                    const nextRows = [...researchGrantRows];
                    nextRows[index] = { ...nextRows[index], amount: event.target.value };
                    setResearchGrantRows(nextRows);
                  }}
                />
              </Field>
              <div className="flex items-end">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={researchGrantRows.length === 1}
                  onClick={() => setResearchGrantRows(researchGrantRows.filter((_, rowIndex) => rowIndex !== index))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            onClick={() => setResearchGrantRows([...researchGrantRows, { title: "", agency: "", amount: "" }])}
          >
            Add research grant
          </button>
          <p className="self-center text-sm text-slate-500">Rows with a title and agency are included in the saved record.</p>
        </div>
      </Section>

      <Section
        title="Additional outcomes"
        description="Record broader collaboration outcomes beyond academic and project activity."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="CSR fund">
            <input className={inputClassName} name="csr_fund" type="number" min="0" step="0.01" placeholder="0" defaultValue={values.csr_fund} />
          </Field>
          <Field label="Centres of excellence">
            <input className={inputClassName} name="centres_of_excellence" type="number" min="0" placeholder="0" defaultValue={values.centres_of_excellence} />
          </Field>
          <Field label="Innovation labs">
            <input className={inputClassName} name="innovation_labs" type="number" min="0" placeholder="0" defaultValue={values.innovation_labs} />
          </Field>
          <Field label="Student projects">
            <input className={inputClassName} name="student_projects" type="number" min="0" placeholder="0" defaultValue={values.student_projects} />
          </Field>
          <Field label="Internships">
            <input className={inputClassName} name="internships" type="number" min="0" placeholder="0" defaultValue={values.internships} />
          </Field>
          <Field label="Placements">
            <input className={inputClassName} name="placements" type="number" min="0" placeholder="0" defaultValue={values.placements} />
          </Field>
        </div>
      </Section>

      <input type="hidden" name="consultancy_projects" value={consultancyProjectsValue} />
      <input type="hidden" name="research_grants" value={researchGrantsValue} />

      <div className="panel flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-6 text-slate-600">
          The saved entry will immediately feed the collaboration list, detail page, KPIs, charts, drill-down table,
          and filter views for all higher levels within scope.
        </p>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}


