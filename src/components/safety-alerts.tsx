"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react"
import { useState } from "react"

interface SafetyAlert {
  id: string
  type: "warning" | "info" | "success"
  title: string
  message: string
  location: string
  timestamp: string
  dismissed: boolean
}

export function SafetyAlerts() {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([
    {
      id: "alert1",
      type: "warning",
      title: "High Traffic Area",
      message: "Heavy tourist traffic reported at Gateway of India. Exercise caution and stay with groups.",
      location: "Gateway of India",
      timestamp: "10 mins ago",
      dismissed: false,
    },
    {
      id: "alert2",
      type: "info",
      title: "Weather Update",
      message: "Light rain expected in the evening. Carry umbrella and avoid waterlogged areas.",
      location: "Mumbai",
      timestamp: "1 hour ago",
      dismissed: false,
    },
    {
      id: "alert3",
      type: "success",
      title: "Safe Zone Entered",
      message: "You have entered a verified safe zone with 24/7 police patrol and CCTV coverage.",
      location: "Colaba",
      timestamp: "2 hours ago",
      dismissed: false,
    },
  ])

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, dismissed: true } : alert)))
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      case "success":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const activeAlerts = alerts.filter((alert) => !alert.dismissed)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Safety Alerts
          </div>
          <Badge variant="secondary">{activeAlerts.length} Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-muted-foreground">No active safety alerts</p>
            <p className="text-sm text-muted-foreground">You're in a safe area</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="border border-border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getAlertIcon(alert.type)}
                    <h4 className="font-medium text-foreground">{alert.title}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getAlertBadgeColor(alert.type)}>{alert.type}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)} className="p-1 h-auto">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{alert.location}</span>
                  <span>{alert.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alert Settings */}
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            Manage Alert Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
