import { NextResponse } from "next/server";
import { listCollaborationsForProfile } from "@/lib/collaborations";
import { parseDashboardFilters } from "@/lib/filtering";
import { getCurrentProfile } from "@/lib/get-current-profile";

export async function GET(request: Request) {
  try {
    const profile = await getCurrentProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const filters = parseDashboardFilters(Object.fromEntries(url.searchParams.entries()));
    const data = await listCollaborationsForProfile(profile, filters);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to load collaborations API data", error);
    return NextResponse.json({ error: "Failed to load collaborations" }, { status: 500 });
  }
}
