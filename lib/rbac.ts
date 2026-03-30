import { RoleKey } from "@/lib/types";

export type RolePermission = {
  scope: "department" | "institute" | "campus" | "university";
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSeeGlobal: boolean;
};

export const roleLabels: Record<RoleKey, string> = {
  department_coordinator: "Department Coordinator",
  institute_coordinator: "Institute Coordinator",
  campus_coordinator: "Campus Coordinator",
  deputy_director: "University Coordinator",
  vice_chancellor: "Vice Chancellor",
  corporate_relations_director: "Corporate Relations Director",
  admin: "Administrator"
};

export const roleConfig: Record<RoleKey, RolePermission> = {
  department_coordinator: {
    scope: "department",
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canSeeGlobal: false
  },
  institute_coordinator: {
    scope: "institute",
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSeeGlobal: false
  },
  campus_coordinator: {
    scope: "campus",
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSeeGlobal: false
  },
  deputy_director: {
    scope: "university",
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSeeGlobal: true
  },
  vice_chancellor: {
    scope: "university",
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSeeGlobal: true
  },
  corporate_relations_director: {
    scope: "university",
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSeeGlobal: true
  },
  admin: {
    scope: "university",
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canSeeGlobal: true
  }
};
