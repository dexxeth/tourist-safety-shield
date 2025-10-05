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

export function DashboardContent() {
  const { user } = useAuth()

  if (!user) return null

  const quickStats = [
    {
      title: "Safety Score",
      value: user.safetyScore,
      unit: "/100",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Alerts",
      value: 2,
      unit: "",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Safe Routes",
      value: 5,
      unit: "",
      icon: Navigation,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Nearby Help",
      value: 12,
      unit: "",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="px-4 py-6">
      {/* Mobile Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hi, {user.name.split(" ")[0]}!</h1>
            <p className="text-sm text-muted-foreground">Stay safe and explore with confidence</p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            Mumbai
          </Badge>
        </div>
        <LanguageSelector />
      </div>

      {/* Quick Stats - Mobile Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold text-foreground">
                    {stat.value}
                    <span className="text-xs font-normal text-muted-foreground">{stat.unit}</span>
                  </p>
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

      {/* Recent Activity - Mobile */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-muted-foreground flex-1">Entered safe zone - Colaba</span>
              <span className="text-xs text-muted-foreground">2h</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="text-muted-foreground flex-1">Safety score updated</span>
              <span className="text-xs text-muted-foreground">4h</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
              <span className="text-muted-foreground flex-1">New route suggestion</span>
              <span className="text-xs text-muted-foreground">6h</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
