"use client"

/**
 * Context and hooks for shared application state
 */

import { createContext, useContext } from "react"
import type { ExchangeServer, LatencySample } from "./types"

export interface AppContextType {
  servers: ExchangeServer[]
  recentSamples: LatencySample[]
  isRealTimeEnabled: boolean
  selectedProvider: string | null
  selectedPair: { from: string; to: string } | undefined
  searchQuery: string
  lowPowerMode: boolean
}

export interface AppContextActions {
  setRealtimeEnabled: (enabled: boolean) => void
  setSelectedProvider: (provider: string | null) => void
  setSelectedPair: (pair: { from: string; to: string } | undefined) => void
  setSearchQuery: (query: string) => void
  setLowPowerMode: (enabled: boolean) => void
  addSamples: (samples: LatencySample[]) => void
}

export const AppContext = createContext<{
  state: AppContextType
  actions: AppContextActions
} | null>(null)

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider")
  }
  return ctx
}
