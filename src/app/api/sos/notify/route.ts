import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import type { TablesInsert } from '@/types/database.types'

// NOTE: This endpoint simulates notifying emergency contacts.
// In production, integrate with an SMS/Email provider (e.g., Twilio/SendGrid)
// and use server-side environment variables for API keys.

type NotifyContact = { id: string; name: string; phone: string; email?: string | null }
type NotifyLocation = { lat?: number | null; lng?: number | null; areaName?: string | null }
type NotifyBody = { userId: string; incidentId?: string | null; contacts: NotifyContact[]; location?: NotifyLocation }
type NotifyResponse = { delivered?: Array<{ id: string }>; warning?: string; error?: string }

export async function POST(req: Request): Promise<NextResponse<NotifyResponse>> {
  try {
    const body: NotifyBody = await req.json()
    const { userId, incidentId, contacts, location } = body || {}
    if (!userId || !Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Optionally, you could verify auth/session here.
  const supabase = await createClient(cookies())

    // Build a human-friendly message
    const message = `SOS Alert: The user needs help. Location: ${location?.areaName || 'Unknown'} (lat: ${location?.lat ?? 'N/A'}, lng: ${location?.lng ?? 'N/A'}). Please reach out immediately.`

    // Simulate sending by writing to notifications table for each contact
    const rows: TablesInsert<'notifications'>[] = contacts.map((c) => ({
      user_id: userId,
      type: 'emergency',
      title: `SOS sent to ${c.name}`,
      message,
      data: { contact_id: c.id, phone: c.phone, email: c.email ?? null, incident_id: incidentId },
      is_read: false,
      send_push: true,
      send_email: !!c.email,
      priority: 'urgent',
    }))

    const { error } = await supabase.from('notifications').insert(rows)
    if (error) {
      console.error('Failed to insert notifications:', error)
      // Still return success to avoid blocking the SOS flow in UI
      return NextResponse.json({ delivered: contacts.map((c) => ({ id: c.id })), warning: 'DB insert failed' })
    }

    // Echo back which contacts were "delivered"
    return NextResponse.json({ delivered: contacts.map((c) => ({ id: c.id })) })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
