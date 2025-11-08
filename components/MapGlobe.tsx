"use client"

import type React from "react"
import { useEffect, useRef, useCallback } from "react"
import type { ExchangeServer, CloudProvider } from "@/lib/types"

interface MapGlobeProps {
  servers: ExchangeServer[]
  selectedPair?: { from: string; to: string }
  onSelectServer?: (server: ExchangeServer) => void
  onServerClick?: (server: ExchangeServer, position: { x: number; y: number }) => void
}

const getProviderColor = (provider: CloudProvider): string => {
  switch (provider) {
    case "AWS":
      return "#FF9900" // Orange
    case "GCP":
      return "#4285F4" // Blue
    case "Azure":
      return "#0078D4" // Darker blue
    case "Other":
      return "#9999FF" // Light purple
  }
}

/**
 * Globe component using canvas-based rendering.
 * Renders a 2D map projection with server markers.
 */
export function MapGlobe({ servers, selectedPair, onSelectServer, onServerClick }: MapGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationIdRef = useRef<number>()
  const scaleRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })

  const width = 1200
  const height = 600

  /** Convert lat/lon to screen coordinates (Mercator projection) */
  const latLonToScreen = useCallback((lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * width
    const latRad = (lat * Math.PI) / 180
    const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * height

    const scale = scaleRef.current
    const pan = panRef.current
    return {
      x: x * scale + pan.x,
      y: y * scale + pan.y,
    }
  }, [])

  /** Convert screen coordinates back to lat/lon */
  const screenToLatLon = useCallback((screenX: number, screenY: number) => {
    const pan = panRef.current
    const scale = scaleRef.current
    const x = (screenX - pan.x) / scale / width
    const y = (screenY - pan.y) / scale / height

    const lon = x * 360 - 180
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y)))
    const lat = (latRad * 180) / Math.PI

    return { lat, lon }
  }, [])

  /** Draw background and grid */
  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "#0a0e1a"
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = "#1a2332"
      ctx.lineWidth = 1

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = latLonToScreen(lat, 0).y
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width * scaleRef.current, y)
        ctx.stroke()
      }

      // Longitude lines
      for (let lon = -180; lon <= 180; lon += 60) {
        const points: Array<{ x: number; y: number }> = []
        for (let lat = -60; lat <= 60; lat += 5) {
          points.push(latLonToScreen(lat, lon))
        }
        ctx.beginPath()
        if (points.length > 0) {
          ctx.moveTo(points[0].x, points[0].y)
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y)
          }
        }
        ctx.stroke()
      }
    },
    [latLonToScreen],
  )

  /** Draw server markers */
  const drawMarkers = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      servers.forEach((server) => {
        const pos = latLonToScreen(server.lat, server.lon)
        const color = getProviderColor(server.provider)

        // Outer glow
        ctx.fillStyle = color + "30"
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2)
        ctx.fill()

        // Main circle
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2)
        ctx.fill()

        // Selected highlight
        if (selectedPair && (selectedPair.from === server.id || selectedPair.to === server.id)) {
          ctx.strokeStyle = "#00FF00"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2)
          ctx.stroke()
        }
      })
    },
    [servers, selectedPair, latLonToScreen],
  )

  /** Draw animated pulses for selected connections */
  const pulseTimeRef = useRef(0)
  const drawPulses = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!selectedPair) return

      const fromSrv = servers.find((s) => s.id === selectedPair.from)
      const toSrv = servers.find((s) => s.id === selectedPair.to)
      if (!fromSrv || !toSrv) return

      const from = latLonToScreen(fromSrv.lat, fromSrv.lon)
      const to = latLonToScreen(toSrv.lat, toSrv.lon)

      pulseTimeRef.current = (pulseTimeRef.current + 1) % 100

      for (let i = 0; i < 3; i++) {
        const progress = ((pulseTimeRef.current + i * 33) % 100) / 100
        const alpha = Math.max(0, 1 - progress)
        const size = progress * 30

        ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.6})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(from.x, from.y, size, 0, Math.PI * 2)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(to.x, to.y, size, 0, Math.PI * 2)
        ctx.stroke()
      }
    },
    [selectedPair, servers, latLonToScreen],
  )

  /** Main animation loop */
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    drawBackground(ctx)
    drawMarkers(ctx)
    drawPulses(ctx)

    animationIdRef.current = requestAnimationFrame(animate)
  }, [drawBackground, drawMarkers, drawPulses])

  // Handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = width
    canvas.height = height
  }, [])

  // Start animation
  useEffect(() => {
    animate()
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [animate])

  // Mouse events for interaction
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    lastMouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return

    const dx = e.clientX - lastMouseRef.current.x
    const dy = e.clientY - lastMouseRef.current.y

    panRef.current.x += dx
    panRef.current.y += dy

    lastMouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    scaleRef.current *= zoomFactor
    scaleRef.current = Math.max(0.5, Math.min(3, scaleRef.current))
  }, [])

  // Add wheel event listener
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on a marker
    let clickedServer: ExchangeServer | null = null
    servers.forEach((server) => {
      const pos = latLonToScreen(server.lat, server.lon)
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)
      if (dist < 10) {
        clickedServer = server
      }
    })

    if (clickedServer) {
      if (onSelectServer) onSelectServer(clickedServer)
      if (onServerClick) onServerClick(clickedServer, { x: e.clientX, y: e.clientY })
    }
  }, [servers, latLonToScreen, onSelectServer, onServerClick])

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-900 overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        className="w-full h-full cursor-move hover:cursor-pointer"
        style={{ touchAction: "none" }}
      />
    </div>
  )
}
