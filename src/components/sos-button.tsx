"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Phone } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { createClient } from "@/utils/supabase/client"
import { useUserLocation } from "@/hooks/use-user-location"
import { useToast } from "@/hooks/use-toast"
import type { TablesInsert, Tables, Json } from "@/types/database.types"

export function SOSButton() {
  const [isActivated, setIsActivated] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()
  const latestLoc = useUserLocation()
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null)

  const handleSOSPress = () => {
    if (isActivated) return

    // Start 5-second countdown before activating SOS
    setCountdown(5)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          activateSOS()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const activateSOS = async () => {
    setIsActivated(true)
    setTimeout(() => toast({ title: 'SOS activated', description: 'We’re notifying your emergency contacts now.', variant: 'critical' }), 0)

  // Create sos_event
    let createdIncidentId: string | null = null
    let canWriteLogs = true
    try {
      if (user) {
        // Validate we have coords before insert to satisfy NOT NULL trigger_latitude/trigger_longitude
        const lat = typeof latestLoc.lat === 'number' ? latestLoc.lat : null
        const lng = typeof latestLoc.lng === 'number' ? latestLoc.lng : null
        if (lat == null || lng == null) {
          console.warn('Missing coordinates for SOS incident; skipping incident insert')
          setTimeout(() => toast({ title: 'SOS started', description: 'Location unavailable; contacts will still be notified.', variant: 'warning' }), 0)
        } else {
          // Minimal payload per schema: user_id + trigger_latitude/trigger_longitude; let enums use defaults
          const payload: Record<string, unknown> = {
            user_id: user.id,
            trigger_latitude: lat,
            trigger_longitude: lng,
            // Optional helpful fields if desired by schema
            trigger_address: latestLoc.areaName || null,
            description: latestLoc.areaName ? `SOS at ${latestLoc.areaName}` : null,
          }
          const { data, error } = await supabase
            .from('sos_incidents')
            .insert(payload as any)
            .select('id')
            .single()
          if (!error && data?.id) {
            createdIncidentId = data.id
            setActiveIncidentId(data.id)
          } else if (error) {
            console.warn('SOS incident create failed with payload keys:', Object.keys(payload as any), error)
            const code = (error as any)?.code as string | undefined
            const message = String((error as any)?.message || '')
            const details = String((error as any)?.details || '')
            if (code === '42703' && (message.includes('sos_incident_logs') || details.includes('sos_incident_logs'))) {
              // DB trigger issue on logs table; proceed without logs
              canWriteLogs = false
            }
            setTimeout(() => toast({ title: 'SOS started without incident record', description: 'Continuing to notify contacts.', variant: 'warning' }), 0)
          }
        }
      }
    } catch {}

    // Notify emergency contacts via API route
    try {
      if (user) {
        const { data: contacts } = await supabase
          .from('emergency_contacts')
          .select('id,name,phone,email,is_primary')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false })
          .limit(5)
        if (!contacts || contacts.length === 0) {
          setTimeout(() => toast({ title: 'No emergency contacts', description: 'Add contacts in Profile settings to notify them during SOS.' }), 0)
        } else {
          type NotifyContact = Pick<Tables<'emergency_contacts'>, 'id' | 'name' | 'phone' | 'email' | 'is_primary'>
          type NotifyResponse = { delivered?: Array<Pick<NotifyContact, 'id'>>; warning?: string; error?: string }
          const res = await fetch('/api/sos/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              incidentId: createdIncidentId,
              contacts: contacts.map((c: NotifyContact) => ({ id: c.id, name: c.name, phone: c.phone, email: c.email })),
              location: {
                lat: latestLoc.lat,
                lng: latestLoc.lng,
                areaName: latestLoc.areaName,
              },
            }),
          })
          const payload: NotifyResponse | null = await res.json().catch(() => null)
          if (res.ok) {
            setTimeout(() => toast({ title: 'Contacts notified', description: `${payload?.delivered?.length ?? contacts.length} contact(s) notified.` }), 0)
            // Log delivery (schema requires actor_type and action)
            try {
              const delivered = (payload?.delivered ?? contacts).map((c: { id: string }) => c.id)
              if (createdIncidentId && delivered.length && canWriteLogs) {
                const logRows: TablesInsert<'sos_incident_logs'>[] = delivered.map((cid: string) => ({
                  incident_id: createdIncidentId!,
                  actor_type: 'system',
                  action: 'contact_notified',
                  log_type: 'contact_attempt',
                  message: 'Notified emergency contact',
                  metadata: { contact_id: cid } as unknown as Json,
                }))
                await supabase.from('sos_incident_logs').insert(logRows as any)
              }
            } catch {}
          } else {
            setTimeout(() => toast({ title: 'Failed to notify contacts', description: payload?.error || 'Please try again.', variant: 'warning' }), 0)
          }
        }
      }
    } catch (e) {
      console.error(e)
    }

    // Reset after 30 seconds (in real app, this would be handled differently)
    setTimeout(async () => {
      setIsActivated(false)
      try {
        if (user) {
          await supabase
            .from("sos_incidents")
            .update({ status: "resolved", resolved_at: new Date().toISOString() })
            .eq("user_id", user.id)
            .eq("status", "active")
        }
      } catch {}
    }, 30000)
  }

  const cancelSOS = () => {
    setCountdown(0)
  }

  if (countdown > 0) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <Button
          size="lg"
          variant="destructive"
          className="w-24 h-24 rounded-full text-white font-bold text-lg animate-pulse"
          onClick={cancelSOS}
        >
          {countdown}
        </Button>
        <p className="text-sm text-red-600 font-medium">Tap to cancel</p>
      </div>
    )
  }

  if (isActivated) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <Button
          size="lg"
          variant="destructive"
          className="w-24 h-24 rounded-full text-white font-bold animate-pulse bg-red-600"
          disabled
        >
          <div className="flex flex-col items-center">
            <Phone className="h-6 w-6 mb-1" />
            <span className="text-xs">ACTIVE</span>
          </div>
        </Button>
        <p className="text-sm text-red-600 font-medium">Emergency services notified</p>
        <Button
          variant="outline"
          className="mt-1 bg-transparent"
          onClick={async () => {
            try {
              if (user) {
                if (activeIncidentId) {
                  // Prefer updating by incident id; avoid enum issues by only setting resolved_at, then best-effort set status
                  await supabase
                    .from('sos_incidents')
                    .update({ resolved_at: new Date().toISOString() })
                    .eq('id', activeIncidentId)
                  // Best-effort: set status to resolved (ignore enum errors)
                  try {
                    await supabase
                      .from('sos_incidents')
                      .update({ status: 'resolved' as any })
                      .eq('id', activeIncidentId)
                  } catch {}
                }
                if (activeIncidentId) {
                  // Log user action per schema
                  await supabase.from('sos_incident_logs').insert({
                    incident_id: activeIncidentId,
                    actor_type: 'user',
                    action: 'sos_disabled',
                    log_type: 'user_action',
                    message: 'User disabled SOS',
                    metadata: null,
                  } as TablesInsert<'sos_incident_logs'>)
                }
              }
            } catch {}
            setIsActivated(false)
            setTimeout(() => toast({ title: 'SOS disabled', description: 'You have cancelled the SOS.' }), 0)
          }}
        >
          Disable SOS
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        size="lg"
        variant="destructive"
        className="w-24 h-24 rounded-full text-white font-bold hover:scale-105 transition-transform"
        onClick={handleSOSPress}
      >
        <div className="flex flex-col items-center">
          <AlertTriangle className="h-8 w-8 mb-1" />
          <span className="text-sm">SOS</span>
        </div>
      </Button>
      <p className="text-sm text-muted-foreground text-center">Emergency Button</p>
    </div>
  )
}
