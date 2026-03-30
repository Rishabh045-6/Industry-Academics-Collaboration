import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/get-current-profile";
import { hasRole } from "@/lib/roles";
import { RoleKey } from "@/lib/types";

export async function requireRole(allowedRoles: RoleKey[]) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!hasRole(profile.role, allowedRoles)) {
    redirect("/dashboard?error=unauthorized");
  }

  return profile;
}
