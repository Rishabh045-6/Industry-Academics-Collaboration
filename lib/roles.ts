import { RoleKey } from "@/lib/types";

export const ROLES = {
  DEPARTMENT_COORDINATOR: "department_coordinator",
  INSTITUTE_COORDINATOR: "institute_coordinator",
  CAMPUS_COORDINATOR: "campus_coordinator",
  DEPUTY_DIRECTOR: "deputy_director",
  VICE_CHANCELLOR: "vice_chancellor",
  CORPORATE_RELATIONS_DIRECTOR: "corporate_relations_director",
  ADMIN: "admin"
} as const;

export const ALL_ROLES: RoleKey[] = [
  ROLES.DEPARTMENT_COORDINATOR,
  ROLES.INSTITUTE_COORDINATOR,
  ROLES.CAMPUS_COORDINATOR,
  ROLES.DEPUTY_DIRECTOR,
  ROLES.VICE_CHANCELLOR,
  ROLES.CORPORATE_RELATIONS_DIRECTOR,
  ROLES.ADMIN
];

export const DEMO_EMAIL = "demo@university.edu";
export const DEMO_ROLE_COOKIE = "demo_selected_role";
export const DEMO_SCOPE_COOKIE = "demo_selected_scope";

export function isRoleKey(value: string): value is RoleKey {
  return ALL_ROLES.includes(value as RoleKey);
}

export function hasRole(role: RoleKey, allowedRoles: RoleKey[]) {
  return allowedRoles.includes(role);
}


