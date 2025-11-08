"use client"

import { useMemo } from "react"
import { useAppContext } from "@/lib/context"
import type { CloudProvider } from "@/lib/types"
import { RealtimeController } from "./RealtimeController"

/**
 * Control panel for filtering, searching, and managing display options
 */
export function ControlPanel() {
  const { state, actions } = useAppContext()

  const providers: CloudProvider[] = ["AWS", "GCP", "Azure", "Other"]

  const filteredServers = useMemo(() => {
    return state.servers.filter((srv) => {
      if (state.selectedProvider && srv.provider !== state.selectedProvider) {
        return false
      }
      if (state.searchQuery && !srv.name.toLowerCase().includes(state.searchQuery.toLowerCase())) {
        return false
      }
      return true
    })
  }, [state.servers, state.selectedProvider, state.searchQuery])

  return (
    <div className="bg-gray-900/90 backdrop-blur border border-gray-700 rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-100">Controls</h2>

      {/* Real-time controls */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2">Mode</label>
        <RealtimeController />
      </div>

      {/* Provider filter */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2">Cloud Provider</label>
        <div className="space-y-1">
          <button
            onClick={() => actions.setSelectedProvider(null)}
            className={`w-full text-left px-2 py-1 rounded text-sm transition ${
              state.selectedProvider === null ? "bg-blue-600/80 text-white" : "text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            All Providers
          </button>
          {providers.map((provider) => (
            <button
              key={provider}
              onClick={() => actions.setSelectedProvider(provider)}
              className={`w-full text-left px-2 py-1 rounded text-sm transition ${
                state.selectedProvider === provider ? "bg-blue-600/80 text-white" : "text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              {provider}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2">Search Servers</label>
        <input
          type="text"
          placeholder="Filter by name..."
          value={state.searchQuery}
          onChange={(e) => actions.setSearchQuery(e.target.value)}
          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Stats */}
      <div className="pt-2 border-t border-gray-700 text-xs text-gray-400 space-y-1">
        <p>Visible Servers: {filteredServers.length}</p>
        <p>Total Connections: {state.recentSamples.length}</p>
        <p>
          Last Update:{" "}
          {state.recentSamples.length > 0
            ? new Date(state.recentSamples[state.recentSamples.length - 1].timestamp).toLocaleTimeString()
            : "N/A"}
        </p>
      </div>
    </div>
  )
}
