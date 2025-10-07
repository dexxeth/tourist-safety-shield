"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { dismissAlert, listSafetyAlerts } from "@/lib/data"
import { createClient as createSupabaseBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface SafetyAlertItem {
  id: string
  type: "warning" | "info" | "success" | "critical"
  title: string
  message: string
  location_text: string | null
  starts_at?: string | null
  dismissed?: boolean
}

export function SafetyAlerts() {
  const [alerts, setAlerts] = useState<SafetyAlertItem[]>([])
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const { toast } = useToast()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const rows = await listSafetyAlerts()
        if (!mounted) return
        const mapped: SafetyAlertItem[] = rows.map((r: any) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          message: r.message,
          location_text: r.location_text,
          starts_at: r.starts_at,
          dismissed: false,
        }))
        setAlerts(mapped)
        setInitialized(true)
      } catch (e) {
        // fallback: no alerts loaded
      }
    })()

    // Realtime subscription to safety_alerts
    const channel = supabase
      .channel('ui_safety_alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'safety_alerts' }, (payload: any) => {
        const r = payload.new || payload.record
        if (!r) return
        const severity = r.severity === 'critical' ? 'critical' : r.severity === 'low' ? 'info' : 'warning'
        const item: SafetyAlertItem = {
          id: r.id,
          type: severity,
          title: r.title,
          message: r.description,
          location_text: r.location_description,
          starts_at: r.valid_from,
          dismissed: false,
        }
        // Insert or update existing
        setAlerts(prev => {
          const exists = prev.some(a => a.id === item.id)
          const next = exists ? prev.map(a => (a.id === item.id ? { ...a, ...item } : a)) : [item, ...prev]
          return next
        })
        // Toast only for realtime events after initial load
        if (initialized) {
          const variant = severity === 'critical' ? 'critical' : severity === 'warning' ? 'warning' : 'info'
          toast({ title: r.title || 'New safety alert', description: r.description || 'A new alert is active in your area.', variant: variant as any })
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'safety_alerts' }, (payload: any) => {
        const r = payload.new || payload.record
        if (!r) return
        setAlerts(prev => prev.map(a => (a.id === r.id ? {
          ...a,
          title: r.title ?? a.title,
          message: r.description ?? a.message,
          location_text: r.location_description ?? a.location_text,
          starts_at: r.valid_from ?? a.starts_at,
          type: r.severity === 'critical' ? 'critical' : r.severity === 'low' ? 'info' : 'warning'
        } : a)))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'safety_alerts' }, (payload: any) => {
        const r = payload.old || payload.record
        if (!r) return
        setAlerts(prev => prev.filter(a => a.id !== r.id))
      })
      .subscribe()

    return () => {
      mounted = false
      try { supabase.removeChannel(channel) } catch {}
    }
  }, [])

  const handleDismiss = async (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a)))
    try {
      await dismissAlert(alertId)
    } catch {}
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
                    <Button variant="ghost" size="sm" onClick={() => handleDismiss(alert.id)} className="p-1 h-auto">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{alert.location_text ?? ""}</span>
                  <span>{alert.starts_at ? new Date(alert.starts_at).toLocaleString() : ""}</span>
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
