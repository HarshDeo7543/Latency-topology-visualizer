"use client"

import { useMemo } from "react"
import { useAppContext } from "@/lib/context"

/**
 * List of servers with click-to-select functionality
 */
export function ServerList() {
  const { state, actions } = useAppContext()

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
    <div className="bg-gray-900/90 backdrop-blur border border-gray-700 rounded-lg p-3 max-h-96 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-200 mb-2">Servers</h3>
      <div className="space-y-1">
        {filteredServers.map((srv) => (
          <button
            key={srv.id}
            onClick={() => {
              if (state.selectedPair?.from === srv.id || state.selectedPair?.to === srv.id) {
                actions.setSelectedPair(null)
              } else if (!state.selectedPair?.from) {
                actions.setSelectedPair({ from: srv.id, to: "", to: "" })
              } else if (!state.selectedPair.to) {
                actions.setSelectedPair({
                  from: state.selectedPair.from,
                  to: srv.id,
                })
              }
            }}
            className={`w-full text-left px-2 py-1 rounded text-xs transition ${
              state.selectedPair?.from === srv.id || state.selectedPair?.to === srv.id
                ? "bg-green-600/80 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <span className="font-mono">{srv.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
