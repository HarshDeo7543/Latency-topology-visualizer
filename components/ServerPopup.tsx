"use client"

import type React from "react"
import type { ExchangeServer } from "@/lib/types"

interface ServerPopupProps {
  server: ExchangeServer | null
  position: { x: number; y: number } | null
  onClose: () => void
}

/**
 * Popup showing detailed server information
 */
export function ServerPopup({ server, position, onClose }: ServerPopupProps) {
  if (!server || !position) return null

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "AWS": return "Amazon Web Services"
      case "GCP": return "Google Cloud Platform"
      case "Azure": return "Microsoft Azure"
      default: return "Other Provider"
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "AWS": return "#FF9900"
      case "GCP": return "#4285F4"
      case "Azure": return "#0078D4"
      default: return "#9999FF"
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 min-w-64"
        style={{
          left: position.x + 10,
          top: position.y - 10,
          transform: position.x > window.innerWidth / 2 ? 'translateX(-100%)' : 'none'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-100 text-sm">{server.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Provider badge */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getProviderColor(server.provider) }}
          />
          <span className="text-xs text-gray-300">{getProviderName(server.provider)}</span>
        </div>

        {/* Location */}
        <div className="space-y-1 text-xs text-gray-400">
          <div>📍 Lat: {server.lat.toFixed(4)}°</div>
          <div>📍 Lon: {server.lon.toFixed(4)}°</div>
          <div>🏷️ ID: {server.id}</div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Click another server to view latency data
          </p>
        </div>
      </div>
    </>
  )
}
