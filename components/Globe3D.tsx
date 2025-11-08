"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import type { ExchangeServer, CloudProvider } from "@/lib/types"

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import("globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
      <div className="text-gray-400">Loading 3D Globe...</div>
    </div>
  )
})

interface Globe3DProps {
  servers: ExchangeServer[]
  selectedPair?: { from: string; to: string }
  onSelectServer?: (server: ExchangeServer) => void
  onServerClick?: (server: ExchangeServer, position: { x: number; y: number }) => void
}

/**
 * 3D Globe component using globe.gl
 * Shows interactive 3D world with server markers and connections
 */
export function Globe3D({ servers, selectedPair, onSelectServer, onServerClick }: Globe3DProps) {
  const globeRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Provider colors
  const getProviderColor = (provider: CloudProvider): string => {
    switch (provider) {
      case "AWS": return "#FF9900" // Orange
      case "GCP": return "#4285F4" // Blue
      case "Azure": return "#0078D4" // Darker blue
      case "Other": return "#9999FF" // Light purple
    }
  }

  // Check if we're on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize globe
  useEffect(() => {
    if (!containerRef.current || isInitialized || !isClient) return

    // Import Globe dynamically to avoid SSR issues
    import("globe.gl").then((GlobeModule) => {
      const Globe = GlobeModule.default

      const globe = Globe()(containerRef.current)
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
        .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
        .width(containerRef.current.clientWidth)
        .height(containerRef.current.clientHeight)
        .showAtmosphere(true)
        .atmosphereColor("lightskyblue")
        .atmosphereAltitude(0.15)

      globeRef.current = globe
      setIsInitialized(true)

      // Handle window resize
      const handleResize = () => {
        if (containerRef.current && globeRef.current) {
          globeRef.current
            .width(containerRef.current.clientWidth)
            .height(containerRef.current.clientHeight)
        }
      }

      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    })
  }, [isInitialized, isClient])

  // Update points data
  useEffect(() => {
    if (!globeRef.current || !isInitialized || !isClient) return

    const pointsData = servers.map(server => ({
      lat: server.lat,
      lng: server.lon,
      size: 0.5,
      color: getProviderColor(server.provider),
      server: server
    }))

    globeRef.current
      .pointsData(pointsData)
      .pointColor("color")
      .pointAltitude(0.01)
      .pointRadius(0.3)
      .pointsMerge(false)
  }, [servers, isInitialized, isClient])

  // Update arcs for selected pair
  useEffect(() => {
    if (!globeRef.current || !isInitialized || !isClient) return

    if (selectedPair?.from && selectedPair?.to) {
      const fromServer = servers.find(s => s.id === selectedPair.from)
      const toServer = servers.find(s => s.id === selectedPair.to)

      if (fromServer && toServer) {
        const arcsData = [{
          startLat: fromServer.lat,
          startLng: fromServer.lon,
          endLat: toServer.lat,
          endLng: toServer.lon,
          color: "#00FF88"
        }]

        globeRef.current
          .arcsData(arcsData)
          .arcColor("color")
          .arcDashLength(0.4)
          .arcDashGap(0.2)
          .arcDashAnimateTime(1500)
          .arcStroke(0.5)
      }
    } else {
      globeRef.current.arcsData([])
    }
  }, [selectedPair, servers, isInitialized, isClient])

  // Handle point clicks
  useEffect(() => {
    if (!globeRef.current || !isInitialized || !isClient) return

    globeRef.current.onPointClick((point: any, event: MouseEvent, coords: any) => {
      if (point && point.server) {
        if (onSelectServer) onSelectServer(point.server)
        if (onServerClick) onServerClick(point.server, { x: event.clientX, y: event.clientY })
      }
    })
  }, [onSelectServer, onServerClick, isInitialized, isClient])

  // Don't render on server side
  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading 3D Globe...</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gray-900"
      style={{ minHeight: "400px" }}
    />
  )
}
