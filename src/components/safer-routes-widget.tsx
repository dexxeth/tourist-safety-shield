"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation, MapPin, Clock, Shield, Route } from "lucide-react"
import { useState } from "react"

interface RouteOption {
  id: string
  name: string
  duration: string
  safetyScore: number
  distance: string
  highlights: string[]
  riskLevel: "low" | "medium" | "high"
}

export function SaferRoutesWidget() {
  const [selectedDestination, setSelectedDestination] = useState("Gateway of India")
  const [isLoading, setIsLoading] = useState(false)

  const routeOptions: RouteOption[] = [
    {
      id: "route1",
      name: "Coastal Route",
      duration: "25 mins",
      safetyScore: 92,
      distance: "3.2 km",
      highlights: ["Well-lit streets", "Police patrol", "Tourist area"],
      riskLevel: "low",
    },
    {
      id: "route2",
      name: "Main Road",
      duration: "18 mins",
      safetyScore: 85,
      distance: "2.8 km",
      highlights: ["Heavy traffic", "CCTV coverage", "Commercial area"],
      riskLevel: "low",
    },
    {
      id: "route3",
      name: "Shortcut Route",
      duration: "12 mins",
      safetyScore: 68,
      distance: "2.1 km",
      highlights: ["Narrow lanes", "Limited lighting", "Avoid after dark"],
      riskLevel: "medium",
    },
  ]

  const popularDestinations = [
    "Gateway of India",
    "Marine Drive",
    "Colaba Causeway",
    "Chhatrapati Shivaji Terminus",
    "Elephanta Caves",
  ]

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleGetDirections = (routeId: string) => {
    setIsLoading(true)
    setTimeout(() => {
      alert(
        `Navigation started for ${routeOptions.find((r) => r.id === routeId)?.name}!\n\nReal-time safety updates will be provided during your journey.`,
      )
      setIsLoading(false)
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Navigation className="h-5 w-5 mr-2" />
          Safer Routes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Destination Selector */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Where would you like to go?</label>
          <div className="flex flex-wrap gap-2">
            {popularDestinations.map((destination) => (
              <Button
                key={destination}
                variant={selectedDestination === destination ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDestination(destination)}
                className={selectedDestination !== destination ? "bg-transparent" : ""}
              >
                {destination}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Location */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>From: Your current location (Bandra West)</span>
        </div>

        {/* Route Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Recommended Routes to {selectedDestination}</h4>

          {routeOptions.map((route) => (
            <div key={route.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Route className="h-5 w-5 text-primary" />
                  <div>
                    <h5 className="font-medium text-foreground">{route.name}</h5>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {route.duration}
                      </span>
                      <span>{route.distance}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">{route.safetyScore}</span>
                  </div>
                  <Badge className={getRiskBadgeColor(route.riskLevel)}>{route.riskLevel} risk</Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {route.highlights.map((highlight, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>

              <Button size="sm" onClick={() => handleGetDirections(route.id)} disabled={isLoading} className="w-full">
                {isLoading ? "Starting Navigation..." : "Get Directions"}
              </Button>
            </div>
          ))}
        </div>

        {/* Safety Tips */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h5 className="font-medium text-foreground mb-2">Safety Tips</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Share your route with emergency contacts</li>
            <li>• Avoid isolated areas, especially after dark</li>
            <li>• Keep your phone charged and location services on</li>
            <li>• Trust your instincts and change routes if needed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
