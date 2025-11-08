/**
 * Mock latency data generator with seeded randomness for reproducibility.
 * Stores samples in memory and provides queryable history.
 */

import type { LatencySample, LatencyStats } from "./types"

const MAX_SAMPLES = 50000
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

// Seeded random for reproducibility
class SeededRandom {
  private seed: number

  constructor(seed = 12345) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
}

let rng = new SeededRandom()
const samples: Map<string, LatencySample[]> = new Map()

/** Get pair key for indexing */
function getPairKey(fromId: string, toId: string): string {
  return `${fromId}-${toId}`
}

/** Generate a single mock sample with realistic variance */
export function generateMockSample(fromId: string, toId: string, baseRtt = 50): LatencySample {
  const variance = rng.next() * 20 - 10
  const jitter = rng.next() * 10
  const rttMs = Math.max(5, baseRtt + variance + jitter)

  return {
    fromId,
    toId,
    timestamp: Date.now(),
    rttMs: Math.round(rttMs),
  }
}

/** Add sample to in-memory store */
export function addSample(sample: LatencySample): void {
  const key = getPairKey(sample.fromId, sample.toId)
  if (!samples.has(key)) {
    samples.set(key, [])
  }

  const list = samples.get(key)!
  list.push(sample)

  // Cleanup old samples
  while (list.length > MAX_SAMPLES) {
    list.shift()
  }

  // Remove very old samples
  const cutoff = Date.now() - RETENTION_MS
  while (list.length > 0 && list[0].timestamp < cutoff) {
    list.shift()
  }
}

/** Query historical samples for a pair */
export function getSamples(fromId: string, toId: string, from?: number, to?: number): LatencySample[] {
  const key = getPairKey(fromId, toId)
  const list = samples.get(key) || []

  if (!from && !to) return list.slice(-10000) // Last 10k samples

  return list
    .filter((s) => {
      if (from && s.timestamp < from) return false
      if (to && s.timestamp > to) return false
      return true
    })
    .slice(-10000) // Bound results
}

/** Compute statistics for samples */
export function getStats(samples: LatencySample[]): LatencyStats {
  if (samples.length === 0) {
    return { min: 0, max: 0, avg: 0, count: 0 }
  }

  const rtts = samples.map((s) => s.rttMs)
  const min = Math.min(...rtts)
  const max = Math.max(...rtts)
  const avg = Math.round(rtts.reduce((a, b) => a + b, 0) / rtts.length)

  return { min, max, avg, count: samples.length }
}

/** Get all recent samples (for dashboard) */
export function getAllRecentSamples(limit = 500): LatencySample[] {
  const allSamples: LatencySample[] = []
  samples.forEach((list) => {
    allSamples.push(...list.slice(-100))
  })
  return allSamples.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
}

/** Reset store (for testing) */
export function resetMockData(): void {
  samples.clear()
  rng = new SeededRandom()
}
