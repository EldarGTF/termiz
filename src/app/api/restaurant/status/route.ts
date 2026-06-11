import { NextResponse } from "next/server";
import { getRestaurantStatus } from "@/actions/restaurant";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getRestaurantStatus();
    if (!status) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(status);
  } catch (error) {
    console.error("restaurant status", error);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
