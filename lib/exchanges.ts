/**
 * Sample exchange servers across major cloud providers
 */

import type { ExchangeServer, CloudProvider } from "./types"

const PROVIDER_COORDS: Record<CloudProvider, Array<{ lat: number; lon: number }>> = {
  AWS: [
    { lat: 40.7128, lon: -74.006 }, // N. Virginia
    { lat: 47.6062, lon: -122.3321 }, // N. California
    { lat: 51.5074, lon: -0.1278 }, // London
    { lat: 55.9375, lon: 37.6054 }, // Frankfurt
    { lat: 35.6762, lon: 139.6503 }, // Tokyo
  ],
  GCP: [
    { lat: 37.3861, lon: -122.0839 }, // Mountain View
    { lat: 48.8566, lon: 2.3522 }, // Paris
    { lat: 1.3521, lon: 103.8198 }, // Singapore
  ],
  Azure: [
    { lat: 42.3601, lon: -71.0589 }, // Boston
    { lat: 52.37, lon: 4.895 }, // Amsterdam
    { lat: 35.0116, lon: 135.768 }, // Osaka
  ],
  Other: [
    { lat: -33.8688, lon: 151.2093 }, // Sydney
  ],
}

export function generateExchangeServers(): ExchangeServer[] {
  const servers: ExchangeServer[] = []
  const exchanges = ["Binance", "Bybit", "OKX", "Deribit", "Kraken"]
  let id = 0

  const providers: CloudProvider[] = ["AWS", "GCP", "Azure", "Other"]

  providers.forEach((provider) => {
    const coords = PROVIDER_COORDS[provider]
    coords.forEach((coord, idx) => {
      const exchange = exchanges[idx % exchanges.length]
      servers.push({
        id: `srv-${id++}`,
        name: `${exchange} (${provider})`,
        lat: coord.lat + (Math.random() - 0.5) * 2,
        lon: coord.lon + (Math.random() - 0.5) * 2,
        provider,
      })
    })
  })

  return servers
}
