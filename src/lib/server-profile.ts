import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

export async function getServerUserProfile() {
  const supabase = await createClient(cookies())
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { session: null, profile: null }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, phone, digital_id, safety_score, is_verified")
    .eq("user_id", session.user.id)
    .single()

  return { session, profile }
}
