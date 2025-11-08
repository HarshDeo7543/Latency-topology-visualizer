/**
 * API route: GET /api/latency/recent
 * Get recent latency samples for dashboard display
 */

import { getAllRecentSamples } from "@/lib/mockLatency"
import { NextResponse } from "next/server"

export async function GET() {
  const samples = getAllRecentSamples(500)
  return NextResponse.json(samples)
}
