"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DigitalIDCard } from "@/components/digital-id-card"
import { SOSButton } from "@/components/sos-button"
import { SaferRoutesWidget } from "@/components/safer-routes-widget"
import { AccommodationFinder } from "@/components/accommodation-finder"
import { LanguageSelector } from "@/components/language-selector"
import { LocationTracker } from "@/components/location-tracker"
import { SafetyAlerts } from "@/components/safety-alerts"
import { MapPin, Shield, TrendingUp, Users, AlertTriangle, Navigation, Hotel, Globe } from "lucide-react"
import { useAuth } from "@/lib/auth"
import Link from "next/link"
import { useUserLocation } from "@/hooks/use-user-location"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useSafetyScore } from "@/hooks/use-safety-score"
import { useEffect, useState } from "react"
import { reverseGeocode } from "@/lib/geocoding"
import { AnimatedNumber } from "@/components/animated-number"
import { useRecentActivity } from "@/hooks/use-recent-activity"
// removed useState since profile completion gating is no longer shown

export function DashboardContent() {
  const { user } = useAuth()
  const latestLoc = useUserLocation()
  const stats = useDashboardStats()
  const liveSafetyScore = useSafetyScore()
  const [displayArea, setDisplayArea] = useState<string>("")
  const [displayCity, setDisplayCity] = useState<string>("")
  const recent = useRecentActivity()

  // Resolve area/city if not present yet but coords are available
  useEffect(() => {
    let cancelled = false
    const resolve = async () => {
      if (latestLoc.areaName || latestLoc.lat == null || latestLoc.lng == null) return
      try {
        const r = await reverseGeocode(latestLoc.lat as number, latestLoc.lng as number)
        if (!cancelled) {
          if (r.area) setDisplayArea(r.area)
          if (r.city) setDisplayCity(r.city)
        }
      } catch {
        // ignore
      }
    }
    resolve()
    return () => { cancelled = true }
  }, [latestLoc.areaName, latestLoc.lat, latestLoc.lng])

  // // Handle loading state
  // if (!user) {
  //   return (
  //     <div className="p-6">
  //       <div className="text-center">
  //         <p>Loading...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // Always show dashboard even if profile is not yet created

  // Safely get user name
  const fullName = (user as any).profile?.full_name || user.email?.split('@')[0] || 'User'
  const firstName = fullName.split(' ')[0] || 'User'

  const quickStats = [
    { key: 'safety', title: "Safety Score", value: (liveSafetyScore ?? stats.safetyScore), unit: "/100", icon: Shield, color: "text-green-600", bgColor: "bg-green-50" },
    { key: 'alerts', title: "Active Alerts", value: stats.activeAlerts, unit: "", icon: AlertTriangle, color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { key: 'routes', title: "Safe Routes", value: stats.safeRoutes, unit: "", icon: Navigation, color: "text-blue-600", bgColor: "bg-blue-50" },
    { key: 'help', title: "Nearby Help", value: stats.nearbyHelp, unit: "", icon: Users, color: "text-purple-600", bgColor: "bg-purple-50" },
  ] as const

  return (
    <div className="px-4 py-6">
      {/* Mobile Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hi, {firstName}!</h1>
            <p className="text-sm text-muted-foreground">Stay safe and explore with confidence</p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            {latestLoc.areaName || displayArea || displayCity || ((latestLoc.lat != null && latestLoc.lng != null)
              ? `${latestLoc.lat.toFixed(2)}, ${latestLoc.lng.toFixed(2)}`
              : 'Locating…')}
          </Badge>
        </div>
        <LanguageSelector />
      </div>

      {/* Quick Stats - Mobile Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickStats.map((stat) => (
          <Card key={stat.key} className="rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold text-foreground">
                    <AnimatedNumber value={Number(stat.value) || 0} />
                    <span className="text-xs font-normal text-muted-foreground">{stat.unit}</span>
                  </p>
                  {stat.key === 'routes' && stats.safeRouteDestinations.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[140px]">
                      to {stats.safeRouteDestinations.join(', ')}
                    </p>
                  )}
                </div>
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SOS Emergency Section - Mobile Priority */}
      <Card className="border-red-200 bg-red-50/50 rounded-2xl mb-6">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold text-red-700 mb-2 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergency Response
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Press SOS to alert authorities and emergency contacts</p>
            <SOSButton />
          </div>
        </CardContent>
      </Card>

      {/* Digital ID Card - Mobile Compact */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">Your Digital ID</h3>
          <Link href="/digital-id">
            <Button variant="ghost" size="sm" className="text-primary">
              View Full
            </Button>
          </Link>
        </div>
        <DigitalIDCard showActions={false} compact={true} />
      </div>

      {/* Safer Routes - Mobile Optimized */}
      <div className="mb-6">
        <SaferRoutesWidget />
      </div>

      {/* Quick Actions - Mobile Grid */}
      <Card className="rounded-2xl mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="sm" className="h-12 flex-col bg-transparent rounded-xl">
            <Hotel className="h-4 w-4 mb-1" />
            <span className="text-xs">Hotels</span>
          </Button>
          <Button variant="outline" size="sm" className="h-12 flex-col bg-transparent rounded-xl">
            <MapPin className="h-4 w-4 mb-1" />
            <span className="text-xs">Location</span>
          </Button>
          <Button variant="outline" size="sm" className="h-12 flex-col bg-transparent rounded-xl">
            <Users className="h-4 w-4 mb-1" />
            <span className="text-xs">Emergency</span>
          </Button>
          <Button variant="outline" size="sm" className="h-12 flex-col bg-transparent rounded-xl">
            <Globe className="h-4 w-4 mb-1" />
            <span className="text-xs">Info</span>
          </Button>
        </CardContent>
      </Card>

      {/* Location Tracking - Mobile */}
      <div className="mb-6">
        <LocationTracker />
      </div>

      {/* Safety Alerts - Mobile */}
      <div className="mb-6">
        <SafetyAlerts />
      </div>

      {/* Accommodation Finder - Mobile */}
      <div className="mb-6">
        <AccommodationFinder />
      </div>

      {/* Recent Activity - Mobile (Realtime) */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recent.length === 0 && (
              <div className="text-sm text-muted-foreground">No recent activity yet.</div>
            )}
            {recent.map((a) => (
              <div key={a.id} className="flex items-center space-x-3 text-sm">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.color === 'green' ? 'bg-green-500' : a.color === 'blue' ? 'bg-blue-500' : a.color === 'yellow' ? 'bg-yellow-500' : a.color === 'purple' ? 'bg-purple-500' : 'bg-red-500'}`}></div>
                <span className="text-muted-foreground flex-1 truncate">{a.message}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(a.timestamp)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts)
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}
