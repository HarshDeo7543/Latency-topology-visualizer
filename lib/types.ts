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
  region?: string
  country?: string
  city?: string
}

export interface LatencySample {
  fromId: string
  toId: string
  timestamp: number
  rttMs: number
}

export interface GlobalPingMeasurement {
  id: string
  type: string
  status: string
  createdAt: string
  updatedAt: string
  target: string
  probesCount: number
  locations: Array<{
    country: string
    city?: string
    region?: string
  }>
  results?: Array<{
    probe: {
      continent: string
      region: string
      country: string
      state: string
      city: string
      asn: number
      longitude: number
      latitude: number
      network: string
      tags: string[]
      resolvers: string[]
    }
    result: {
      status: string
      rawOutput: string
      resolvedAddress: string
      resolvedHostname: string
      timings: Array<{
        ttl: number
        rtt: number
      }>
      stats: {
        min: number
        max: number
        avg: number
        total: number
        loss: number
        rcv: number
        drop: number
      }
    }
  }>
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
