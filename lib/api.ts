/**
 * API client for latency data and helpers
 */

import type { LatencySample, LatencyStats } from "./types"

export async function fetchLatencySamples(
  fromId: string,
  toId: string,
  from?: number,
  to?: number,
): Promise<LatencySample[]> {
  const params = new URLSearchParams()
  params.set("from", fromId)
  params.set("to", toId)
  if (from) params.set("fromTime", from.toString())
  if (to) params.set("toTime", to.toString())

  const res = await fetch(`/api/latency/history?${params}`)
  if (!res.ok) throw new Error("Failed to fetch samples")
  return res.json()
}

export async function fetchLatencyStats(
  fromId: string,
  toId: string,
  from?: number,
  to?: number,
): Promise<LatencyStats> {
  const params = new URLSearchParams()
  params.set("from", fromId)
  params.set("to", toId)
  if (from) params.set("fromTime", from.toString())
  if (to) params.set("toTime", to.toString())

  const res = await fetch(`/api/latency/stats?${params}`)
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

export async function fetchRecentSamples(): Promise<LatencySample[]> {
  const res = await fetch("/api/latency/recent")
  if (!res.ok) throw new Error("Failed to fetch recent samples")
  return res.json()
}
