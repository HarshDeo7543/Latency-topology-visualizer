/**
 * Globalping API client for real network latency measurements
 * Uses the free Globalping API to get actual ping data between locations
 */

import type { GlobalPingMeasurement, LatencySample, ExchangeServer } from "./types"

const GLOBALPING_API_BASE = "https://api.globalping.io/v1"

/**
 * Create a ping measurement between two locations
 */
export async function createPingMeasurement(
  fromServer: ExchangeServer,
  toServer: ExchangeServer
): Promise<GlobalPingMeasurement> {
  // Use coordinates to determine country/city for Globalping
  const fromLocation = getLocationFromCoords(fromServer.lat, fromServer.lon)
  const requestBody = {
    type: "ping",
    target: getTargetForServer(toServer),
    locations: [fromLocation],
    measurementOptions: {
      packets: 3,
      timeout: 1000
    }
  }

  const response = await fetch(`${GLOBALPING_API_BASE}/measurements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error(`Globalping API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get measurement results by ID
 */
export async function getMeasurementResults(measurementId: string): Promise<GlobalPingMeasurement> {
  const response = await fetch(`${GLOBALPING_API_BASE}/measurements/${measurementId}`)

  if (!response.ok) {
    throw new Error(`Failed to get measurement results: ${response.status}`)
  }

  return response.json()
}

/**
 * Wait for measurement to complete and return results
 */
export async function waitForMeasurement(measurementId: string, timeoutMs = 30000): Promise<GlobalPingMeasurement> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMs) {
    const measurement = await getMeasurementResults(measurementId)

    if (measurement.status === "finished") {
      return measurement
    }

    // Wait 2 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  throw new Error(`Measurement ${measurementId} timed out`)
}

/**
 * Convert Globalping measurement to our LatencySample format
 */
export function measurementToLatencySample(
  measurement: GlobalPingMeasurement,
  fromServer: ExchangeServer,
  toServer: ExchangeServer
): LatencySample | null {
  if (!measurement.results || measurement.results.length === 0) {
    return null
  }

  const result = measurement.results[0]
  if (result.result.status !== "finished") {
    return null
  }

  return {
    fromId: fromServer.id,
    toId: toServer.id,
    timestamp: new Date(measurement.createdAt).getTime(),
    rttMs: Math.round(result.result.stats.avg)
  }
}

/**
 * Get location info from coordinates (simplified mapping)
 */
function getLocationFromCoords(lat: number, lon: number): { country: string; city?: string } {
  // Simplified coordinate to country mapping
  // In a real implementation, you'd use a proper geocoding service
  if (lat > 50 && lon > -10 && lon < 10) return { country: "GB", city: "London" } // London
  if (lat > 40 && lat < 50 && lon > -80 && lon < -70) return { country: "US", city: "New York" } // NYC
  if (lat > 35 && lat < 45 && lon > -125 && lon < -115) return { country: "US", city: "California" } // California
  if (lat > 48 && lat < 52 && lon > 4 && lon < 6) return { country: "NL", city: "Amsterdam" } // Amsterdam
  if (lat > 35 && lat < 37 && lon > 135 && lon < 145) return { country: "JP", city: "Tokyo" } // Tokyo
  if (lat > 1 && lat < 2 && lon > 103 && lon < 105) return { country: "SG", city: "Singapore" } // Singapore
  if (lat > -35 && lat < -32 && lon > 150 && lon < 152) return { country: "AU", city: "Sydney" } // Sydney

  // Default to US if no match
  return { country: "US" }
}

/**
 * Get a suitable ping target for a server
 * Uses common services that should be available globally
 */
function getTargetForServer(server: ExchangeServer): string {
  // Use different targets based on provider to avoid rate limiting
  switch (server.provider) {
    case "AWS":
      return "amazon.com"
    case "GCP":
      return "google.com"
    case "Azure":
      return "microsoft.com"
    default:
      return "cloudflare.com"
  }
}

/**
 * Check if Globalping API is available
 */
export async function checkApiAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${GLOBALPING_API_BASE}/measurements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "ping",
        target: "google.com",
        locations: [{ country: "US" }]
      })
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get real latency data for a pair of servers
 */
export async function getRealLatencySample(
  fromServer: ExchangeServer,
  toServer: ExchangeServer
): Promise<LatencySample | null> {
  try {
    // Create measurement
    const measurement = await createPingMeasurement(fromServer, toServer)

    // Wait for completion
    const completedMeasurement = await waitForMeasurement(measurement.id)

    // Convert to our format
    return measurementToLatencySample(completedMeasurement, fromServer, toServer)
  } catch (error) {
    console.warn(`Failed to get real latency for ${fromServer.id} -> ${toServer.id}:`, error)
    return null
  }
}
