/**
 * API route: GET /api/latency/stats
 * Get statistics for a pair
 */

import { getSamples, getStats } from "@/lib/mockLatency"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fromId = searchParams.get("from")
  const toId = searchParams.get("to")
  const fromTime = searchParams.get("fromTime")
  const toTime = searchParams.get("toTime")

  if (!fromId || !toId) {
    return NextResponse.json({ error: "from and to parameters required" }, { status: 400 })
  }

  const samples = getSamples(
    fromId,
    toId,
    fromTime ? Number.parseInt(fromTime) : undefined,
    toTime ? Number.parseInt(toTime) : undefined,
  )

  return NextResponse.json(getStats(samples))
}
