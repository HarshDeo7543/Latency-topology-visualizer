"use client"

import type React from "react"
import { useRef, useCallback } from "react"
import type { ExchangeServer, LatencySample } from "@/lib/types"

interface LatencyArcsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  servers: ExchangeServer[]
  samples: LatencySample[]
  latLonToScreen: (lat: number, lon: number) => { x: number; y: number }
  maxArcs?: number
}

/**
 * Renders animated arcs between servers based on recent latency samples
 */
export function useLatencyArcs({ canvasRef, servers, samples, latLonToScreen, maxArcs = 150 }: LatencyArcsProps) {
  const arcTimeRef = useRef(0)

  const drawArcs = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (samples.length === 0) return

      arcTimeRef.current = (arcTimeRef.current + 1) % 100

      // Get top recent arcs by latency
      const arcMap = new Map<string, LatencySample>()
      samples.forEach((sample) => {
        const key = `${sample.fromId}-${sample.toId}`
        if (!arcMap.has(key) || arcMap.get(key)!.timestamp < sample.timestamp) {
          arcMap.set(key, sample)
        }
      })

      const topArcs = Array.from(arcMap.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, maxArcs)

      topArcs.forEach((sample) => {
        const from = servers.find((s) => s.id === sample.fromId)
        const to = servers.find((s) => s.id === sample.toId)
        if (!from || !to) return

        const fromPos = latLonToScreen(from.lat, from.lon)
        const toPos = latLonToScreen(to.lat, to.lon)

        // Color based on latency (green=fast, red=slow)
        const normalized = Math.min(sample.rttMs / 200, 1)
        const hue = (1 - normalized) * 120
        const color = `hsl(${hue}, 100%, 50%)`

        // Draw animated arc
        const progress = (arcTimeRef.current / 100) * Math.PI * 2
        const animAlpha = Math.sin(progress) * 0.3 + 0.2

        ctx.strokeStyle =
          color +
          Math.floor(animAlpha * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(fromPos.x, fromPos.y)

        // Quadratic curve
        const midX = (fromPos.x + toPos.x) / 2
        const midY = (fromPos.y + toPos.y) / 2
        const dx = toPos.x - fromPos.x
        const dy = toPos.y - fromPos.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const perpX = -dy / dist
        const perpY = dx / dist
        const controlX = midX + perpX * dist * 0.1
        const controlY = midY + perpY * dist * 0.1

        ctx.quadraticCurveTo(controlX, controlY, toPos.x, toPos.y)
        ctx.stroke()

        // Small dot traveling along arc
        const t = (arcTimeRef.current / 100 + Math.random()) % 1
        const dotX = (1 - t) * (1 - t) * fromPos.x + 2 * (1 - t) * t * controlX + t * t * toPos.x
        const dotY = (1 - t) * (1 - t) * fromPos.y + 2 * (1 - t) * t * controlY + t * t * toPos.y

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2)
        ctx.fill()
      })
    },
    [samples, servers, latLonToScreen, maxArcs],
  )

  return { drawArcs }
}
