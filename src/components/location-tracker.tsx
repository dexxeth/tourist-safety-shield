"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Eye, EyeOff, Users } from "lucide-react"
import { useState } from "react"

export function LocationTracker() {
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  const currentLocation = {
    area: "Bandra West",
    coordinates: "19.0596° N, 72.8295° E",
    safetyLevel: "Safe",
    lastUpdated: "2 minutes ago",
  }

  const handleToggleTracking = () => {
    setIsTrackingEnabled(!isTrackingEnabled)
    alert(
      isTrackingEnabled
        ? "Location tracking disabled. Emergency services will not be able to locate you automatically."
        : "Location tracking enabled. Your location will be shared with emergency services when needed.",
    )
  }

  const handleShareLocation = () => {
    alert(
      "Location shared with emergency contacts!\n\nYour current location has been sent to all registered emergency contacts.",
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location Tracking
          </div>
          <Badge
            variant={isTrackingEnabled ? "default" : "secondary"}
            className={isTrackingEnabled ? "bg-green-500" : ""}
          >
            {isTrackingEnabled ? "Active" : "Disabled"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-foreground">Current Location</h4>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(!isVisible)} className="p-1">
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {isVisible && (
            <div className="space-y-2">
              <p className="text-sm text-foreground">{currentLocation.area}</p>
              <p className="text-xs text-muted-foreground font-mono">{currentLocation.coordinates}</p>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-800">{currentLocation.safetyLevel}</Badge>
                <span className="text-xs text-muted-foreground">Updated {currentLocation.lastUpdated}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Real-time Tracking</p>
              <p className="text-xs text-muted-foreground">Allow authorities to track your location for safety</p>
            </div>
            <Button variant={isTrackingEnabled ? "destructive" : "default"} size="sm" onClick={handleToggleTracking}>
              {isTrackingEnabled ? "Disable" : "Enable"}
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLocation}
            className="w-full bg-transparent"
            disabled={!isTrackingEnabled}
          >
            <Users className="h-4 w-4 mr-2" />
            Share with Emergency Contacts
          </Button>
        </div>

        {/* Privacy Notice */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <Navigation className="h-3 w-3 inline mr-1" />
            Your location data is encrypted and only shared with authorized emergency services and your designated
            contacts.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
