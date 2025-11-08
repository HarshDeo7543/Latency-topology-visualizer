"use client"

import { useState } from "react"
import { useAppContext } from "@/lib/context"
import { AppProvider } from "@/components/AppProvider"
import { MapGlobe } from "@/components/MapGlobe"
import { Legend } from "@/components/Legend"
import { ControlPanel } from "@/components/ControlPanel"
import { ServerList } from "@/components/ServerList"
import { HistoricalChart } from "@/components/HistoricalChart"
import { ServerPopup } from "@/components/ServerPopup"
import { Globe3D } from "@/components/Globe3D"
import type { ExchangeServer } from "@/lib/types"

/**
 * Main visualization dashboard
 */
function Dashboard() {
  const { state, actions } = useAppContext()
  const [showChart, setShowChart] = useState(false)
  const [popupServer, setPopupServer] = useState<ExchangeServer | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null)
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d")

  return (
    <div className="w-full h-screen bg-gray-950 flex flex-col lg:flex-row overflow-hidden">
      {/* Globe - main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 relative">
          {/* View mode toggle */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <button
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                viewMode === "3d"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              3D Globe
            </button>
            <button
              onClick={() => setViewMode("2d")}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                viewMode === "2d"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              2D Map
            </button>
          </div>

          {viewMode === "3d" ? (
            <Globe3D
              servers={state.servers}
              selectedPair={state.selectedPair}
              onSelectServer={(srv) => {
                if (!state.selectedPair?.from) {
                  actions.setSelectedPair({ from: srv.id, to: "" })
                } else if (state.selectedPair.from !== srv.id) {
                  actions.setSelectedPair({
                    from: state.selectedPair.from,
                    to: srv.id,
                  })
                }
              }}
              onServerClick={(server, position) => {
                setPopupServer(server)
                setPopupPosition(position)
              }}
            />
          ) : (
            <MapGlobe
              servers={state.servers}
              selectedPair={state.selectedPair}
              onSelectServer={(srv) => {
                if (!state.selectedPair?.from) {
                  actions.setSelectedPair({ from: srv.id, to: "" })
                } else if (state.selectedPair.from !== srv.id) {
                  actions.setSelectedPair({
                    from: state.selectedPair.from,
                    to: srv.id,
                  })
                }
              }}
              onServerClick={(server, position) => {
                setPopupServer(server)
                setPopupPosition(position)
              }}
            />
          )}
        </div>

        {/* Selected pair info */}
        {state.selectedPair?.from && state.selectedPair?.to && (
          <div className="bg-gray-800/90 border-t border-gray-700 px-4 py-2 text-sm text-gray-300">
            <button onClick={() => setShowChart(!showChart)} className="font-semibold hover:text-white transition">
              {state.selectedPair.from} ↔ {state.selectedPair.to} {showChart ? "▼" : "▶"}
            </button>
          </div>
        )}

        {/* Chart drawer */}
        {showChart && state.selectedPair?.from && state.selectedPair?.to && (
          <div className="bg-gray-800/90 border-t border-gray-700 px-4 py-3 max-h-64 overflow-y-auto">
            <HistoricalChart fromId={state.selectedPair.from} toId={state.selectedPair.to} />
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 bg-gray-900/95 border-t lg:border-t-0 lg:border-l border-gray-700 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {/* Header */}
          <div>
            <h1 className="text-lg font-bold text-gray-100">Latency Topology</h1>
            <p className="text-xs text-gray-500">Exchange server connections</p>
          </div>

          {/* Legend */}
          <Legend />

          {/* Control Panel */}
          <ControlPanel />

          {/* Server List */}
          <ServerList />
        </div>

        {/* Footer info */}
        <div className="border-t border-gray-700 p-3 text-xs text-gray-500">
          <p>Live updates every 7s</p>
          <p className="mt-1">© 2025 • Latency Topology Visualizer</p>
        </div>
      </div>

      {/* Server popup */}
      <ServerPopup
        server={popupServer}
        position={popupPosition}
        onClose={() => {
          setPopupServer(null)
          setPopupPosition(null)
        }}
      />
    </div>
  )
}

/**
 * Root page with provider
 */
export default function Page() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  )
}
