import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/lib/aggregation";
import { parseDashboardFilters } from "@/lib/filtering";
import { getCurrentProfile } from "@/lib/get-current-profile";

export async function GET(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filters = parseDashboardFilters(Object.fromEntries(request.nextUrl.searchParams.entries()));
    const data = await getDashboardData(profile, filters);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load dashboard API data", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
