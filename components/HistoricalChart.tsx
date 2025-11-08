"use client"

import React, { useMemo, useState, useEffect } from "react"
import useSWR from "swr"
import type { LatencySample, LatencyStats, TimeRange } from "@/lib/types"
import { getStats } from "@/lib/mockLatency"

interface HistoricalChartProps {
  fromId: string
  toId: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * Historical latency chart with time-series data and statistics
 */
export function HistoricalChart({ fromId, toId }: HistoricalChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h")
  const [isLoading, setIsLoading] = useState(false)

  const timeRangeMs: Record<TimeRange, number> = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  }

  const fromTime = Date.now() - timeRangeMs[timeRange]
  const toTime = Date.now()

  const { data: samples, error: sampleError } = useSWR(
    `/api/latency/history?from=${fromId}&to=${toId}&fromTime=${fromTime}&toTime=${toTime}`,
    fetcher,
    { revalidateOnFocus: false },
  )

  const stats = useMemo(() => {
    if (!samples) return null
    return getStats(samples)
  }, [samples])

  const chartData = useMemo(() => {
    if (!samples || samples.length === 0) return null

    // Resample to max 100 points for cleaner rendering
    const interval = Math.max(1, Math.floor(samples.length / 100))
    const points = []
    for (let i = 0; i < samples.length; i += interval) {
      points.push(samples[i])
    }

    return points
  }, [samples])

  if (sampleError) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded p-3 text-sm text-red-200">
        Error loading chart data
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Time range selector */}
      <div className="flex gap-2">
        {(Object.keys(timeRangeMs) as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-2 py-1 rounded text-xs font-medium transition ${
              timeRange === range ? "bg-blue-600/80 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">Min</div>
            <div className="text-lg font-mono font-semibold text-green-400">{stats.min}ms</div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">Avg</div>
            <div className="text-lg font-mono font-semibold text-blue-400">{stats.avg}ms</div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">Max</div>
            <div className="text-lg font-mono font-semibold text-red-400">{stats.max}ms</div>
          </div>
        </div>
      )}

      {/* Chart canvas */}
      <div className="bg-gray-900/50 rounded border border-gray-700 p-2 h-48">
        {chartData ? (
          <Chart samples={chartData} stats={stats} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
            {samples === undefined ? "Loading..." : "No data available"}
          </div>
        )}
      </div>

      {/* Sample count */}
      {stats && (
        <div className="text-xs text-gray-400">
          {stats.count} samples over {timeRange}
        </div>
      )}
    </div>
  )
}

/**
 * Canvas-based chart renderer
 */
function Chart({
  samples,
  stats,
}: {
  samples: LatencySample[]
  stats: LatencyStats | null
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !stats) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    canvas.width = width
    canvas.height = height

    const padding = 30
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Background
    ctx.fillStyle = "rgba(15, 23, 42, 0.5)"
    ctx.fillRect(0, 0, width, height)

    // Grid lines
    ctx.strokeStyle = "rgba(75, 85, 99, 0.2)"
    ctx.lineWidth = 1
    const gridLines = 4
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (chartHeight / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Y-axis labels
    ctx.fillStyle = "rgba(156, 163, 175, 0.7)"
    ctx.font = "11px monospace"
    ctx.textAlign = "right"
    for (let i = 0; i <= gridLines; i++) {
      const value = stats.max - (stats.max - stats.min) * (i / gridLines)
      const y = padding + (chartHeight / gridLines) * i
      ctx.fillText(`${Math.round(value)}ms`, padding - 5, y + 3)
    }

    // Plot line
    if (samples.length > 0) {
      ctx.strokeStyle = "#60a5fa"
      ctx.lineWidth = 2
      ctx.beginPath()

      samples.forEach((sample, idx) => {
        const x = padding + (chartWidth / (samples.length - 1 || 1)) * idx
        const normalized = stats.max === stats.min ? 0.5 : (sample.rttMs - stats.min) / (stats.max - stats.min)
        const y = padding + chartHeight - normalized * chartHeight

        if (idx === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Scatter points
      ctx.fillStyle = "#60a5fa"
      samples.forEach((sample, idx) => {
        const x = padding + (chartWidth / (samples.length - 1 || 1)) * idx
        const normalized = stats.max === stats.min ? 0.5 : (sample.rttMs - stats.min) / (stats.max - stats.min)
        const y = padding + chartHeight - normalized * chartHeight

        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // X-axis
    ctx.strokeStyle = "rgba(156, 163, 175, 0.3)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, padding + chartHeight)
    ctx.lineTo(width - padding, padding + chartHeight)
    ctx.stroke()
  }, [samples, stats])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
}
