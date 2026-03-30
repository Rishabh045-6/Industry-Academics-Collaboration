import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DEMO_EMAIL, DEMO_ROLE_COOKIE, DEMO_SCOPE_COOKIE, ROLES, isRoleKey } from "@/lib/roles";
import { RoleKey } from "@/lib/types";

export type CurrentProfile = {
  id: string;
  full_name: string | null;
  email: string;
  role: RoleKey;
  university_id: string | null;
  campus_id: string | null;
  institute_id: string | null;
  department_id: string | null;
};

async function loadProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; email?: string | null }
) {
  const profileColumns = "id, full_name, email, role, university_id, campus_id, institute_id, department_id";
  const byIdResult = await supabase.from("profiles").select(profileColumns).eq("id", user.id).maybeSingle();

  if (byIdResult.data) {
    return byIdResult;
  }

  if (byIdResult.error) {
    console.error("Profile lookup by id failed", {
      userId: user.id,
      email: user.email ?? null,
      code: byIdResult.error.code,
      message: byIdResult.error.message,
      details: byIdResult.error.details,
      hint: byIdResult.error.hint
    });
  } else {
    console.warn("Profile lookup by id returned no row", {
      userId: user.id,
      email: user.email ?? null
    });
  }

  if (!user.email) {
    return byIdResult;
  }

  const byEmailResult = await supabase.from("profiles").select(profileColumns).eq("email", user.email).maybeSingle();

  if (byEmailResult.data) {
    console.warn("Resolved profile by email fallback", {
      userId: user.id,
      profileId: byEmailResult.data.id,
      email: user.email
    });
  } else if (byEmailResult.error) {
    console.error("Profile lookup by email failed", {
      userId: user.id,
      email: user.email,
      code: byEmailResult.error.code,
      message: byEmailResult.error.message,
      details: byEmailResult.error.details,
      hint: byEmailResult.error.hint
    });
  } else {
    console.warn("Profile lookup by email returned no row", {
      userId: user.id,
      email: user.email
    });
  }

  return byEmailResult;
}

async function inferScopeFromCollaborations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  column: "campus_id" | "institute_id" | "department_id",
  value: string | number
) {
  const { data: collaboration, error } = await supabase
    .from("collaborations")
    .select("university_id, campus_id, institute_id, department_id")
    .eq(column, value)
    .limit(1)
    .maybeSingle();

  console.info("Demo scope fallback lookup", {
    column,
    value,
    error: error?.message ?? null,
    collaboration
  });

  if (error) {
    console.error("Demo scope fallback query failed", {
      column,
      value,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    return null;
  }

  if (!collaboration) {
    return null;
  }

  return {
    university_id: collaboration.university_id ?? null,
    campus_id: collaboration.campus_id ?? null,
    institute_id: collaboration.institute_id ?? null,
    department_id: collaboration.department_id ?? null
  };
}

async function inferScopeFromHierarchyCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  role: RoleKey,
  selectedScope: string
) {
  let query;

  switch (role) {
    case ROLES.DEPARTMENT_COORDINATOR:
      query = supabase
        .from("collaborations")
        .select("university_id, campus_id, institute_id, department_id, departments!inner(code)")
        .eq("departments.code", selectedScope)
        .limit(1)
        .maybeSingle();
      break;
    case ROLES.INSTITUTE_COORDINATOR:
      query = supabase
        .from("collaborations")
        .select("university_id, campus_id, institute_id, department_id, institutes!inner(code)")
        .eq("institutes.code", selectedScope)
        .limit(1)
        .maybeSingle();
      break;
    case ROLES.CAMPUS_COORDINATOR:
      query = supabase
        .from("collaborations")
        .select("university_id, campus_id, institute_id, department_id, campuses!inner(code)")
        .eq("campuses.code", selectedScope)
        .limit(1)
        .maybeSingle();
      break;
    default:
      return null;
  }

  const { data, error } = await query;

  console.info("Demo scope code fallback lookup", {
    role,
    selectedScope,
    error: error?.message ?? null,
    collaboration: data
  });

  if (error) {
    console.error("Demo scope code fallback query failed", {
      role,
      selectedScope,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    university_id: data.university_id ?? null,
    campus_id: data.campus_id ?? null,
    institute_id: data.institute_id ?? null,
    department_id: data.department_id ?? null
  };
}

async function resolveDepartmentScope(
  supabase: Awaited<ReturnType<typeof createClient>>,
  departmentCode: string
) {
  const { data: department, error: departmentError } = await supabase
    .from("departments")
    .select("id, institute_id")
    .eq("code", departmentCode)
    .limit(1)
    .maybeSingle();

  console.info("Demo department scope lookup", {
    departmentCode,
    department,
    error: departmentError?.message ?? null
  });

  if (departmentError) {
    console.error("Demo department scope query failed", {
      departmentCode,
      code: departmentError.code,
      message: departmentError.message,
      details: departmentError.details,
      hint: departmentError.hint
    });
  }

  if (!department) {
    return inferScopeFromHierarchyCode(supabase, ROLES.DEPARTMENT_COORDINATOR, departmentCode);
  }

  const fallbackScope = await inferScopeFromCollaborations(supabase, "department_id", department.id);

  const { data: institute, error: instituteError } = await supabase
    .from("institutes")
    .select("id, campus_id")
    .eq("id", department.institute_id)
    .maybeSingle();

  console.info("Demo department parent institute lookup", {
    departmentCode,
    institute,
    error: instituteError?.message ?? null
  });

  if (instituteError) {
    console.error("Demo department institute query failed", {
      departmentCode,
      code: instituteError.code,
      message: instituteError.message,
      details: instituteError.details,
      hint: instituteError.hint
    });
  }

  if (!institute) {
    if (
      fallbackScope?.university_id != null &&
      fallbackScope.campus_id != null &&
      fallbackScope.institute_id != null &&
      fallbackScope.department_id != null
    ) {
      return fallbackScope;
    }

    return null;
  }

  const { data: campus, error: campusError } = await supabase
    .from("campuses")
    .select("id, university_id")
    .eq("id", institute.campus_id)
    .maybeSingle();

  console.info("Demo department parent campus lookup", {
    departmentCode,
    campus,
    error: campusError?.message ?? null
  });

  if (campusError) {
    console.error("Demo department campus query failed", {
      departmentCode,
      code: campusError.code,
      message: campusError.message,
      details: campusError.details,
      hint: campusError.hint
    });
  }

  if (!campus || campus.university_id == null) {
    if (
      fallbackScope?.university_id != null &&
      fallbackScope.campus_id != null &&
      fallbackScope.institute_id != null &&
      fallbackScope.department_id != null
    ) {
      return fallbackScope;
    }

    return null;
  }

  return {
    university_id: campus.university_id,
    campus_id: campus.id,
    institute_id: institute.id,
    department_id: department.id
  };
}

async function resolveInstituteScope(
  supabase: Awaited<ReturnType<typeof createClient>>,
  instituteCode: string
) {
  const { data: institute, error: instituteError } = await supabase
    .from("institutes")
    .select("id, campus_id")
    .eq("code", instituteCode)
    .limit(1)
    .maybeSingle();

  console.info("Demo institute scope lookup", {
    instituteCode,
    institute,
    error: instituteError?.message ?? null
  });

  if (instituteError) {
    console.error("Demo institute scope query failed", {
      instituteCode,
      code: instituteError.code,
      message: instituteError.message,
      details: instituteError.details,
      hint: instituteError.hint
    });
  }

  if (!institute) {
    return inferScopeFromHierarchyCode(supabase, ROLES.INSTITUTE_COORDINATOR, instituteCode);
  }

  const fallbackScope = await inferScopeFromCollaborations(supabase, "institute_id", institute.id);

  const { data: campus, error: campusError } = await supabase
    .from("campuses")
    .select("id, university_id")
    .eq("id", institute.campus_id)
    .maybeSingle();

  console.info("Demo institute parent campus lookup", {
    instituteCode,
    campus,
    error: campusError?.message ?? null
  });

  if (campusError) {
    console.error("Demo institute campus query failed", {
      instituteCode,
      code: campusError.code,
      message: campusError.message,
      details: campusError.details,
      hint: campusError.hint
    });
  }

  if (!campus || campus.university_id == null) {
    if (
      fallbackScope?.university_id != null &&
      fallbackScope.campus_id != null &&
      fallbackScope.institute_id != null
    ) {
      return {
        university_id: fallbackScope.university_id,
        campus_id: fallbackScope.campus_id,
        institute_id: fallbackScope.institute_id,
        department_id: null
      };
    }

    return null;
  }

  return {
    university_id: campus.university_id,
    campus_id: campus.id,
    institute_id: institute.id,
    department_id: null
  };
}

async function resolveCampusScope(
  supabase: Awaited<ReturnType<typeof createClient>>,
  campusCode: string
) {
  const { data: campus, error: campusError } = await supabase
    .from("campuses")
    .select("id, university_id")
    .eq("code", campusCode)
    .limit(1)
    .maybeSingle();

  console.info("Demo campus scope lookup", {
    campusCode,
    campus,
    error: campusError?.message ?? null
  });

  if (campusError) {
    console.error("Demo campus scope query failed", {
      campusCode,
      code: campusError.code,
      message: campusError.message,
      details: campusError.details,
      hint: campusError.hint
    });
  }

  if (!campus) {
    return inferScopeFromHierarchyCode(supabase, ROLES.CAMPUS_COORDINATOR, campusCode);
  }

  const fallbackScope = await inferScopeFromCollaborations(supabase, "campus_id", campus.id);

  if (campus.university_id == null) {
    if (fallbackScope?.university_id != null && fallbackScope.campus_id != null) {
      return {
        university_id: fallbackScope.university_id,
        campus_id: fallbackScope.campus_id,
        institute_id: null,
        department_id: null
      };
    }

    return null;
  }

  return {
    university_id: campus.university_id,
    campus_id: campus.id,
    institute_id: null,
    department_id: null
  };
}

function normalizeDemoScopeValue(value: string) {
  const parts = value
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts[parts.length - 1] : value.trim();
}

async function resolveDemoScope(
  supabase: Awaited<ReturnType<typeof createClient>>,
  role: RoleKey,
  selectedScope: string
) {
  if (!selectedScope) {
    return null;
  }

  const normalizedScope = normalizeDemoScopeValue(selectedScope);

  switch (role) {
    case ROLES.DEPARTMENT_COORDINATOR:
      return resolveDepartmentScope(supabase, normalizedScope);
    case ROLES.INSTITUTE_COORDINATOR:
      return resolveInstituteScope(supabase, normalizedScope);
    case ROLES.CAMPUS_COORDINATOR:
      return resolveCampusScope(supabase, normalizedScope);
    default:
      return null;
  }
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const authCookieNames = cookieStore
    .getAll()
    .map((cookie) => cookie.name)
    .filter((name) => name.startsWith("sb-"));
  const authUserResult = await supabase.auth.getUser();
  const user = authUserResult.data.user;

  console.info("Current profile auth resolution", {
    userId: user?.id ?? null,
    email: user?.email ?? null,
    authUserError: authUserResult.error?.message ?? null,
    authCookieNames
  });

  if (!user) {
    return null;
  }

  const { data: profile, error } = await loadProfile(supabase, user);

  console.info("Current profile query result", {
    userId: user.id,
    email: user.email ?? null,
    profileId: profile?.id ?? null,
    profileEmail: profile?.email ?? null,
    profileRole: profile?.role ?? null,
    profileError: error?.message ?? null,
    profileLookupRan: true
  });

  if (error || !profile) {
    return null;
  }

  const demoSelectedRole = cookieStore.get(DEMO_ROLE_COOKIE)?.value;
  const demoSelectedScope = cookieStore.get(DEMO_SCOPE_COOKIE)?.value;
  const isDemoUser = user.email === DEMO_EMAIL;
  const resolvedRole =
    isDemoUser && demoSelectedRole && isRoleKey(demoSelectedRole)
      ? demoSelectedRole
      : profile.role;

  const resolvedProfile: CurrentProfile = {
    ...(profile as CurrentProfile),
    role: resolvedRole
  };

  if (isDemoUser && demoSelectedScope) {
    const demoScope = await resolveDemoScope(supabase, resolvedRole, demoSelectedScope);

    console.info("Current profile demo override resolution", {
      userId: user.id,
      email: user.email ?? null,
      resolvedRole,
      selectedDemoScope: demoSelectedScope,
      demoScopeResolved: Boolean(demoScope)
    });

    if (demoScope) {
      return {
        ...resolvedProfile,
        ...demoScope
      };
    }
  }

  return resolvedProfile;
}






