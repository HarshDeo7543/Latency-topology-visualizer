"use client"

import type { CloudProvider } from "@/lib/types"

const PROVIDER_COLORS: Record<CloudProvider, { color: string; name: string }> = {
  AWS: { color: "#FF9900", name: "AWS" },
  GCP: { color: "#4285F4", name: "Google Cloud" },
  Azure: { color: "#0078D4", name: "Microsoft Azure" },
  Other: { color: "#9999FF", name: "Other" },
}

/**
 * Legend showing cloud provider color coding
 */
export function Legend() {
  return (
    <div className="bg-gray-800/80 backdrop-blur rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-200">Cloud Providers</h3>
      <div className="space-y-2">
        {Object.entries(PROVIDER_COLORS).map(([_, { color, name }]) => (
          <div key={name} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-300">{name}</span>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-gray-700 text-xs text-gray-400">
        <p>• Drag to pan</p>
        <p>• Scroll to zoom</p>
        <p>• Click marker to select</p>
      </div>
    </div>
  )
}
