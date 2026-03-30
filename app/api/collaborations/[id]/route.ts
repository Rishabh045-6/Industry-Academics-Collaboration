import { NextResponse } from "next/server";
import { getCollaborationDetailForProfile } from "@/lib/collaborations";
import { getCurrentProfile } from "@/lib/get-current-profile";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getCurrentProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const record = await getCollaborationDetailForProfile(profile, id);

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to load collaboration detail API data", error);
    return NextResponse.json({ error: "Failed to load collaboration" }, { status: 500 });
  }
}
