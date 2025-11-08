"use client"
import { useAppContext } from "@/lib/context"

/**
 * UI controls for real-time and performance modes
 */
export function RealtimeController() {
  const { state, actions } = useAppContext()

  return (
    <div className="flex gap-2">
      <button
        onClick={() => actions.setRealtimeEnabled(!state.isRealTimeEnabled)}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          state.isRealTimeEnabled
            ? "bg-green-600/80 text-white hover:bg-green-600"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        {state.isRealTimeEnabled ? "● Live" : "○ Paused"}
      </button>
      <button
        onClick={() => actions.setLowPowerMode(!state.lowPowerMode)}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          state.lowPowerMode
            ? "bg-blue-600/80 text-white hover:bg-blue-600"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        {state.lowPowerMode ? "⚡ Low Power" : "⚙ Normal"}
      </button>
    </div>
  )
}
