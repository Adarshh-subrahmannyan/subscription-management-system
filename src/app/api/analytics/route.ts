import { NextResponse } from "next/server";
import { getBillingAnalytics } from "@/modules/analytics";

export async function GET() {
  try {
    const analytics = await getBillingAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}