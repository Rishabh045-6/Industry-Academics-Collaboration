"use client";

import { useFormStatus } from "react-dom";
import { useMemo, useState } from "react";
import { login } from "@/lib/supabase/action";
import { RoleKey } from "@/lib/types";

type StepKey = "role" | "campus" | "institute" | "department" | "field" | "credentials";

type DepartmentOption = {
  value: string;
  label: string;
};

type InstituteOption = {
  value: string;
  label: string;
  departments: DepartmentOption[];
};

type CampusOption = {
  value: string;
  label: string;
  institutes: InstituteOption[];
};

type FieldOption = {
  value: string;
  label: string;
};

const roleCards: Array<{
  value: RoleKey;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    value: "department_coordinator",
    label: "Department Coordinator",
    icon: "🏫",
    description: "Pick a campus, then institute, then department before login."
  },
  {
    value: "institute_coordinator",
    label: "Institute Coordinator",
    icon: "🏛️",
    description: "Pick a campus and institute before entering credentials."
  },
  {
    value: "campus_coordinator",
    label: "Campus Coordinator",
    icon: "🌆",
    description: "Select a campus and then sign in."
  },
  {
    value: "deputy_director",
    label: "University Coordinator",
    icon: "🎓",
    description: "Select your university field and proceed to login."
  },
  {
    value: "vice_chancellor",
    label: "Vice Chancellor",
    icon: "👩‍💼",
    description: "Sign in directly after choosing the role."
  },
  {
    value: "corporate_relations_director",
    label: "Corporate Relations Director",
    icon: "🤝",
    description: "Sign in directly after choosing the role."
  },
  {
    value: "admin",
    label: "Administrator",
    icon: "🛠️",
    description: "Sign in directly after choosing the role."
  }
];

const campusHierarchy: CampusOption[] = [
  {
    value: "BLR",
    label: "Bangalore campus",
    institutes: [
      {
        value: "MIT-BLR",
        label: "Manipal Institute of Technology, Bangalore",
        departments: [
          { value: "SOCE", label: "School of Computer Engineering" },
          { value: "ECE", label: "Electronics and Communication Engineering" },
          { value: "SH", label: "Sciences and Humanities" }
        ]
      },
      {
        value: "DLHS-BLR",
        label: "Department of Liberal and Health Sciences, Bangalore",
        departments: [
          { value: "DLHS-BLR-1", label: "Dept 1" },
          { value: "DLHS-BLR-2", label: "Dept 2" },
          { value: "DLHS-BLR-3", label: "Dept 3" },
          { value: "DLHS-BLR-4", label: "Dept 4" }
        ]
      },
      {
        value: "SMI-BLR",
        label: "Srishti Manipal Institute of Art, Design and Technology (SMI)",
        departments: [
          { value: "SMI-BLR-1", label: "Dept 1" },
          { value: "SMI-BLR-2", label: "Dept 2" },
          { value: "SMI-BLR-3", label: "Dept 3" },
          { value: "SMI-BLR-4", label: "Dept 4" }
        ]
      },
      {
        value: "TAPMI-BLR",
        label: "T. A. Pai Management Institute (TAPMI), Bangalore",
        departments: [
          { value: "TAPMI-BLR-1", label: "Dept 1" },
          { value: "TAPMI-BLR-2", label: "Dept 2" },
          { value: "TAPMI-BLR-3", label: "Dept 3" },
          { value: "TAPMI-BLR-4", label: "Dept 4" }
        ]
      },
      {
        value: "MLS-BLR",
        label: "Manipal Law School (MLS)",
        departments: [
          { value: "MLS-BLR-1", label: "Dept 1" },
          { value: "MLS-BLR-2", label: "Dept 2" },
          { value: "MLS-BLR-3", label: "Dept 3" },
          { value: "MLS-BLR-4", label: "Dept 4" }
        ]
      },
      {
        value: "MIRM-BLR",
        label: "Manipal Institute of Regenerative Medicine (MIRM)",
        departments: [
          { value: "MIRM-BLR-1", label: "Dept 1" },
          { value: "MIRM-BLR-2", label: "Dept 2" },
          { value: "MIRM-BLR-3", label: "Dept 3" },
          { value: "MIRM-BLR-4", label: "Dept 4" }
        ]
      }
    ]
  },
  {
    value: "MPL",
    label: "Manipal campus",
    institutes: [
      {
        value: "MIT-MPL",
        label: "Manipal Institute of Technology (MIT), Manipal",
        departments: [
          { value: "CSE", label: "Computer Science and Engineering" },
          { value: "MECH", label: "Mechanical Engineering" },
          { value: "MIT-MPL-3", label: "Dept 3" },
          { value: "MIT-MPL-4", label: "Dept 4" }
        ]
      },
      {
        value: "TAPMI-MPL",
        label: "T. A. Pai Management Institute (TAPMI)",
        departments: [
          { value: "TAPMI-MPL-1", label: "Dept 1" },
          { value: "TAPMI-MPL-2", label: "Dept 2" },
          { value: "TAPMI-MPL-3", label: "Dept 3" },
          { value: "TAPMI-MPL-4", label: "Dept 4" }
        ]
      }
    ]
  },
  {
    value: "MGR",
    label: "Mangalore campus",
    institutes: [
      {
        value: "KMC-MGR",
        label: "Kasturba Medical College, Mangalore",
        departments: [
          { value: "KMC-MGR-1", label: "Dept 1" },
          { value: "KMC-MGR-2", label: "Dept 2" },
          { value: "KMC-MGR-3", label: "Dept 3" },
          { value: "KMC-MGR-4", label: "Dept 4" }
        ]
      },
      {
        value: "MCODS-MGR",
        label: "Manipal College of Dental Sciences, Mangalore",
        departments: [
          { value: "MCODS-MGR-1", label: "Dept 1" },
          { value: "MCODS-MGR-2", label: "Dept 2" },
          { value: "MCODS-MGR-3", label: "Dept 3" },
          { value: "MCODS-MGR-4", label: "Dept 4" }
        ]
      }
    ]
  },
  {
    value: "JSR",
    label: "Jamshedpur campus",
    institutes: [
      {
        value: "MTMC-JSR",
        label: "Manipal Tata Medical College, Jamshedpur",
        departments: [
          { value: "MTMC-JSR-1", label: "Dept 1" },
          { value: "MTMC-JSR-2", label: "Dept 2" },
          { value: "MTMC-JSR-3", label: "Dept 3" },
          { value: "MTMC-JSR-4", label: "Dept 4" }
        ]
      }
    ]
  },
  {
    value: "DXB",
    label: "Dubai campus",
    institutes: [
      {
        value: "SOE-IT-DXB",
        label: "School of Engineering & IT, Dubai",
        departments: [
          { value: "SOE-IT-DXB-1", label: "Dept 1" },
          { value: "SOE-IT-DXB-2", label: "Dept 2" },
          { value: "SOE-IT-DXB-3", label: "Dept 3" },
          { value: "SOE-IT-DXB-4", label: "Dept 4" }
        ]
      },
      {
        value: "MBS-DXB",
        label: "Manipal Business School, Dubai",
        departments: [
          { value: "MBS-DXB-1", label: "Dept 1" },
          { value: "MBS-DXB-2", label: "Dept 2" },
          { value: "MBS-DXB-3", label: "Dept 3" },
          { value: "MBS-DXB-4", label: "Dept 4" }
        ]
      },
      {
        value: "SDA-DXB",
        label: "School of Design & Architecture, Dubai",
        departments: [
          { value: "SDA-DXB-1", label: "Dept 1" },
          { value: "SDA-DXB-2", label: "Dept 2" },
          { value: "SDA-DXB-3", label: "Dept 3" },
          { value: "SDA-DXB-4", label: "Dept 4" }
        ]
      },
      {
        value: "SLS-DXB",
        label: "School of Life Sciences, Dubai",
        departments: [
          { value: "SLS-DXB-1", label: "Dept 1" },
          { value: "SLS-DXB-2", label: "Dept 2" },
          { value: "SLS-DXB-3", label: "Dept 3" },
          { value: "SLS-DXB-4", label: "Dept 4" }
        ]
      },
      {
        value: "MILA-DXB",
        label: "Manipal Institute of Liberal Arts, Dubai",
        departments: [
          { value: "MILA-DXB-1", label: "Dept 1" },
          { value: "MILA-DXB-2", label: "Dept 2" },
          { value: "MILA-DXB-3", label: "Dept 3" },
          { value: "MILA-DXB-4", label: "Dept 4" }
        ]
      },
      {
        value: "SMC-DXB",
        label: "School of Media & Communication, Dubai",
        departments: [
          { value: "SMC-DXB-1", label: "Dept 1" },
          { value: "SMC-DXB-2", label: "Dept 2" },
          { value: "SMC-DXB-3", label: "Dept 3" },
          { value: "SMC-DXB-4", label: "Dept 4" }
        ]
      },
      {
        value: "SCM-DXB",
        label: "School of Commerce & Management, Dubai",
        departments: [
          { value: "SCM-DXB-1", label: "Dept 1" },
          { value: "SCM-DXB-2", label: "Dept 2" },
          { value: "SCM-DXB-3", label: "Dept 3" },
          { value: "SCM-DXB-4", label: "Dept 4" }
        ]
      },
      {
        value: "PT-DXB",
        label: "Professional Training, Dubai",
        departments: [
          { value: "PT-DXB-1", label: "Dept 1" },
          { value: "PT-DXB-2", label: "Dept 2" },
          { value: "PT-DXB-3", label: "Dept 3" },
          { value: "PT-DXB-4", label: "Dept 4" }
        ]
      }
    ]
  }
];

const fieldOptions: FieldOption[] = [
  { value: "Health Sciences", label: "Health Sciences" },
  { value: "Technical, Management and Humanities", label: "Technical, Management and Humanities" }
];

const roleStepMap: Record<RoleKey, StepKey[]> = {
  department_coordinator: ["role", "campus", "institute", "department", "credentials"],
  institute_coordinator: ["role", "campus", "institute", "credentials"],
  campus_coordinator: ["role", "campus", "credentials"],
  deputy_director: ["role", "field", "credentials"],
  vice_chancellor: ["role", "credentials"],
  corporate_relations_director: ["role", "credentials"],
  admin: ["role", "credentials"]
};

const stepTitles: Record<StepKey, string> = {
  role: "Choose your role",
  campus: "Choose a campus",
  institute: "Choose an institute",
  department: "Choose a department",
  field: "Choose your university field",
  credentials: "Enter your credentials"
};

const stepHelpText: Record<StepKey, string> = {
  role: "Pick the role that matches your access level.",
  campus: "Choose the campus you are assigned to.",
  institute: "Choose the institute under that campus.",
  department: "Choose the department you manage.",
  field: "Choose the field scope you monitor.",
  credentials: "Enter the email address and password for your selected scope."
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function DemoLoginForm({ errorMessage }: { errorMessage?: string }) {
  const [selectedRole, setSelectedRole] = useState<RoleKey | "">("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedInstitute, setSelectedInstitute] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedField, setSelectedField] = useState("");

  const currentSteps = useMemo<StepKey[]>(() => {
    if (!selectedRole) {
      return ["role"];
    }
    return roleStepMap[selectedRole];
  }, [selectedRole]);

  const currentStep = currentSteps[Math.min(currentStepIndex, currentSteps.length - 1)];

  const selectedCampusData = useMemo(
    () => campusHierarchy.find((campus) => campus.value === selectedCampus),
    [selectedCampus]
  );

  const selectedInstituteData = useMemo(
    () =>
      selectedCampusData?.institutes.find((institute) => institute.value === selectedInstitute) ?? null,
    [selectedCampusData, selectedInstitute]
  );

  const needsCampus = currentSteps.includes("campus");
  const needsInstitute = currentSteps.includes("institute");
  const needsDepartment = currentSteps.includes("department");
  const needsField = currentSteps.includes("field");

  const showCredentials = currentStep === "credentials";

  const demoScopeValue = useMemo(() => {
    if (selectedDepartment) {
      return `${selectedCampus}|${selectedInstitute}|${selectedDepartment}`;
    }
    if (selectedInstitute) {
      return `${selectedCampus}|${selectedInstitute}`;
    }
    if (selectedCampus) {
      return selectedCampus;
    }
    return selectedField;
  }, [selectedCampus, selectedInstitute, selectedDepartment, selectedField]);

  function resetChildSelections(stepIndex: number) {
    if (stepIndex < 1) {
      setSelectedCampus("");
      setSelectedInstitute("");
      setSelectedDepartment("");
      setSelectedField("");
    }
    if (stepIndex < 2) {
      setSelectedInstitute("");
      setSelectedDepartment("");
    }
    if (stepIndex < 3) {
      setSelectedDepartment("");
    }
    if (stepIndex < 1) {
      setSelectedField("");
    }
  }

  function handleSelectRole(role: RoleKey) {
    setSelectedRole(role);
    setSelectedCampus("");
    setSelectedInstitute("");
    setSelectedDepartment("");
    setSelectedField("");
    const nextIndex = roleStepMap[role].length > 1 ? 1 : 0;
    setCurrentStepIndex(nextIndex);
  }

  function handleSelectCampus(campusValue: string) {
    setSelectedCampus(campusValue);
    setSelectedInstitute("");
    setSelectedDepartment("");
    setSelectedField("");
    if (currentStepIndex + 1 < currentSteps.length) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }

  function handleSelectInstitute(instituteValue: string) {
    setSelectedInstitute(instituteValue);
    setSelectedDepartment("");
    if (currentStepIndex + 1 < currentSteps.length) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }

  function handleSelectDepartment(departmentValue: string) {
    setSelectedDepartment(departmentValue);
    if (currentStepIndex + 1 < currentSteps.length) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }

  function handleSelectField(fieldValue: string) {
    setSelectedField(fieldValue);
    if (currentStepIndex + 1 < currentSteps.length) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }

  function handleBack() {
    if (currentStepIndex === 0) {
      return;
    }
    const previousIndex = currentStepIndex - 1;
    resetChildSelections(previousIndex);
    setCurrentStepIndex(previousIndex);
  }

  const canSubmit = Boolean(
    selectedRole &&
      (!needsCampus || selectedCampus) &&
      (!needsInstitute || selectedInstitute) &&
      (!needsDepartment || selectedDepartment) &&
      (!needsField || selectedField)
  );

  return (
    <form action={login} className="space-y-6">
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      <input type="hidden" name="role" value={selectedRole} />
      <input type="hidden" name="demo_scope" value={demoScopeValue} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Step {Math.min(currentStepIndex + 1, currentSteps.length)} of {currentSteps.length}</p>
          <h2 className="mt-3 text-lg font-semibold text-white">{stepTitles[currentStep]}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{stepHelpText[currentStep]}</p>
        </div>
        {currentStepIndex > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/10"
          >
            ← Back
          </button>
        ) : null}
      </div>

      {currentStep === "role" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {roleCards.map((role) => {
            const isSelected = selectedRole === role.value;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => handleSelectRole(role.value)}
                className={`flex flex-col rounded-3xl border px-4 py-4 text-left transition ${
                  isSelected
                    ? "border-blue-400 bg-white/10 shadow-xl shadow-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <span className="mb-3 text-3xl">{role.icon}</span>
                <p className="font-semibold text-white">{role.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{role.description}</p>
              </button>
            );
          })}
        </div>
      ) : null}

      {currentStep === "campus" ? (
        <div className="grid gap-3">
          {campusHierarchy.map((campus) => {
            const isSelected = selectedCampus === campus.value;
            return (
              <button
                key={campus.value}
                type="button"
                onClick={() => handleSelectCampus(campus.value)}
                className={`rounded-3xl border px-4 py-4 text-left transition ${
                  isSelected
                    ? "border-blue-400 bg-white/10 shadow-xl shadow-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <p className="font-semibold text-white">{campus.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{campus.institutes.length} institutes available</p>
              </button>
            );
          })}
        </div>
      ) : null}

      {currentStep === "institute" ? (
        <div className="grid gap-3">
          {selectedCampusData?.institutes.map((institute) => {
            const isSelected = selectedInstitute === institute.value;
            return (
              <button
                key={institute.value}
                type="button"
                onClick={() => handleSelectInstitute(institute.value)}
                className={`rounded-3xl border px-4 py-4 text-left transition ${
                  isSelected
                    ? "border-blue-400 bg-white/10 shadow-xl shadow-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <p className="font-semibold text-white">{institute.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{institute.departments.length} department options</p>
              </button>
            );
          })}
        </div>
      ) : null}

      {currentStep === "department" ? (
        <div className="grid gap-3">
          {selectedInstituteData?.departments.map((department) => {
            const isSelected = selectedDepartment === department.value;
            return (
              <button
                key={department.value}
                type="button"
                onClick={() => handleSelectDepartment(department.value)}
                className={`rounded-3xl border px-4 py-4 text-left transition ${
                  isSelected
                    ? "border-blue-400 bg-white/10 shadow-xl shadow-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <p className="font-semibold text-white">{department.label}</p>
              </button>
            );
          })}
        </div>
      ) : null}

      {currentStep === "field" ? (
        <div className="grid gap-3">
          {fieldOptions.map((field) => {
            const isSelected = selectedField === field.value;
            return (
              <button
                key={field.value}
                type="button"
                onClick={() => handleSelectField(field.value)}
                className={`rounded-3xl border px-4 py-4 text-left transition ${
                  isSelected
                    ? "border-blue-400 bg-white/10 shadow-xl shadow-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <p className="font-semibold text-white">{field.label}</p>
              </button>
            );
          })}
        </div>
      ) : null}

      {showCredentials ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-white/65">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@university.edu"
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-white/65">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="........"
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          {selectedRole
            ? "Complete the current step to unlock credentials."
            : "Select a role to begin the login flow."}
        </div>
      )}

      <SubmitButton disabled={!canSubmit} />
    </form>
  );
}
