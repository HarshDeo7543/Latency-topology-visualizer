/**
 * Core data types for the Latency Topology Visualizer
 */

export type CloudProvider = "AWS" | "GCP" | "Azure" | "Other"

export interface ExchangeServer {
  id: string
  name: string
  lat: number
  lon: number
  provider: CloudProvider
  icon?: string
}

export interface LatencySample {
  fromId: string
  toId: string
  timestamp: number
  rttMs: number
}

export interface LatencyStats {
  min: number
  max: number
  avg: number
  count: number
}

export interface ArcConnection {
  from: string
  to: string
  rttMs: number
  timestamp: number
  color: string
}

export type TimeRange = "1h" | "24h" | "7d" | "30d"
