"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import useSWR from "swr"
import { AppContext, type AppContextType, type AppContextActions } from "@/lib/context"
import type { LatencySample } from "@/lib/types"
import { generateExchangeServers } from "@/lib/exchanges"
import { generateMockSample, addSample } from "@/lib/mockLatency"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * Root provider managing global state and real-time updates
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppContextType>({
    servers: [],
    recentSamples: [],
    isRealTimeEnabled: true,
    selectedProvider: null,
    selectedPair: undefined,
    searchQuery: "",
    lowPowerMode: false,
  })

  const actions: AppContextActions = {
    setRealtimeEnabled: useCallback((enabled: boolean) => {
      setState((s) => ({ ...s, isRealTimeEnabled: enabled }))
    }, []),
    setSelectedProvider: useCallback((provider: string | null) => {
      setState((s) => ({ ...s, selectedProvider: provider }))
    }, []),
    setSelectedPair: useCallback((pair: { from: string; to: string } | undefined) => {
      setState((s) => ({ ...s, selectedPair: pair }))
    }, []),
    setSearchQuery: useCallback((query: string) => {
      setState((s) => ({ ...s, searchQuery: query }))
    }, []),
    setLowPowerMode: useCallback((enabled: boolean) => {
      setState((s) => ({ ...s, lowPowerMode: enabled }))
    }, []),
    addSamples: useCallback((samples: LatencySample[]) => {
      setState((s) => {
        const newSamples = [...s.recentSamples, ...samples]
        return {
          ...s,
          recentSamples: newSamples.slice(-500),
        }
      })
    }, []),
  }

  // Initialize servers
  useEffect(() => {
    const servers = generateExchangeServers()
    setState((s) => ({ ...s, servers }))

    // Generate initial mock samples
    servers.forEach((srv) => {
      for (let i = 0; i < Math.min(5, servers.length - 1); i++) {
        const otherSrv = servers[(servers.indexOf(srv) + i + 1) % servers.length]
        addSample(generateMockSample(srv.id, otherSrv.id, 50 + Math.random() * 100))
      }
    })
  }, [])

  // Polling for real-time updates
  const { data: recentData, error: recentError } = useSWR(
    state.isRealTimeEnabled ? "/api/latency/recent" : null,
    fetcher,
    { refreshInterval: state.isRealTimeEnabled ? 7000 : 0 },
  )

  // Generate real-time latency updates (with Globalping API fallback to mock)
  useEffect(() => {
    if (!state.isRealTimeEnabled) return

    const interval = setInterval(async () => {
      const samples: LatencySample[] = []
      const servers = state.servers

      if (servers.length > 1) {
        for (let i = 0; i < Math.min(5, servers.length); i++) { // Reduced frequency for real API
          const from = servers[Math.floor(Math.random() * servers.length)]
          const to = servers[Math.floor(Math.random() * servers.length)]
          if (from.id !== to.id) {
            try {
              // Try to get real latency data first
              const { getRealLatencySample } = await import("@/lib/globalping")
              const realSample = await getRealLatencySample(from, to)

              if (realSample) {
                addSample(realSample)
                samples.push(realSample)
              } else {
                // Fallback to mock data
                const mockSample = generateMockSample(from.id, to.id, 50 + Math.random() * 100)
                addSample(mockSample)
                samples.push(mockSample)
              }
            } catch (error) {
              console.warn("Globalping API failed, using mock data:", error)
              // Fallback to mock data on API error
              const mockSample = generateMockSample(from.id, to.id, 50 + Math.random() * 100)
              addSample(mockSample)
              samples.push(mockSample)
            }
          }
        }
      }

      setState((s) => {
        const newSamples = [...s.recentSamples, ...samples]
        return {
          ...s,
          recentSamples: newSamples.slice(-500),
        }
      })
    }, 15000)

    return () => clearInterval(interval)
  }, [state.isRealTimeEnabled, state.servers])

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>
}
