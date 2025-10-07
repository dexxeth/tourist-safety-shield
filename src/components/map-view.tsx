"use client"

import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import React from 'react'

export interface MapRoute {
  id: string
  coords: [number, number][]
  color?: string
  weight?: number
}

export interface MapViewProps {
  center: { lat: number; lng: number }
  destination?: { lat: number; lng: number }
  routes?: MapRoute[]
  height?: number
}

export default function MapView({ center, destination, routes = [], height = 240 }: MapViewProps) {
  const centerPos: LatLngExpression = [center.lat, center.lng]
  return (
    <div className="rounded-md overflow-hidden border">
      <MapContainer center={centerPos as any} zoom={13} style={{ height, width: '100%' }} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CircleMarker center={centerPos as any} pathOptions={{ color: '#2563eb' }} radius={6 as any} />
        {destination && (
          <CircleMarker center={[destination.lat, destination.lng] as any} pathOptions={{ color: '#059669' }} radius={6 as any} />
        )}
        {routes.map((r) => (
          <Polyline key={r.id} positions={r.coords as unknown as LatLngExpression[]} pathOptions={{ color: r.color || '#2563eb', weight: (r.weight || 4) as any, opacity: 0.85 }} />
        ))}
      </MapContainer>
    </div>
  )
}
