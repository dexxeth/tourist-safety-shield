"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { createClient as createSupabaseBrowserClient } from "@/utils/supabase/client"

// Shape used across the app - updated to match existing schema
export interface User {
  id: string
  name: string
  email: string | null
  phone: string | null
  digitalId: string | null
  safetyScore: number
  isVerified: boolean
  verificationLevel: 'unverified' | 'basic' | 'verified' | 'premium'
  nationality: string | null
  avatarUrl: string | null
  emergencySharing: boolean
  locationSharing: boolean
  lastSeenAt: string | null
  // Digital ID info
  digitalIdStatus?: 'pending' | 'active' | 'suspended' | 'expired' | 'revoked'
  digitalIdExpires?: string | null
  qrCodeUrl?: string | null
  // Counts for UI
  emergencyContactsCount?: number
  verifiedDocumentsCount?: number
}

interface AuthContext {
  user: any | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  completeProfile: (profileData: any) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContext | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()

  const fetchUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session) {
        console.log("No session found")
        setUser(null)
        return
      }

      console.log("Session found for user:", session.user.id)

      // Get profile data directly from tables (handle missing profile gracefully)
      const { data: profiles, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)

      if (profileErr) {
        console.error("Profile fetch error:", profileErr)
        setUser(null)
        return
      }

      const profile = profiles?.[0] || null
      if (!profile) {
        console.log("No profile found for user - this is normal for new registrations")
        setUser({ ...session.user, profile: null } as any)
        return
      }

      console.log("Profile loaded:", profile)

      // Get digital ID data separately
      const { data: digitalIds, error: digitalIdErr } = await supabase
        .from("digital_ids")
        .select("tss_id, status, qr_code_url, expires_at")
        .eq("user_id", session.user.id)
        .limit(1)

      if (digitalIdErr) {
        console.warn("Digital ID fetch warning:", digitalIdErr)
      }
      const digitalId = digitalIds?.[0] || null
      console.log("Digital ID loaded:", digitalId)

      // Get counts (avoid HEAD to prevent proxy/browser blocking); use GET with limit(0)
      const { count: contactsCount } = await supabase
        .from("emergency_contacts")
        .select("*", { count: 'exact' })
        .eq("user_id", session.user.id)
        .limit(0)

      const { count: documentsCount } = await supabase
        .from("id_documents")
        .select("*", { count: 'exact' })
        .eq("user_id", session.user.id)
        .eq("is_verified", true)
        .limit(0)

      // Map to User interface
      setUser({
        id: profile.user_id,
        name: profile.full_name || '',
        email: profile.email,
        phone: profile.phone,
        digitalId: digitalId?.tss_id || null,
        safetyScore: Number(profile.safety_score ?? 75),
        isVerified: Boolean(profile.is_verified ?? false),
        verificationLevel: profile.verification_level || 'unverified',
        nationality: profile.nationality,
        avatarUrl: profile.avatar_url,
        emergencySharing: profile.emergency_sharing ?? true,
        locationSharing: profile.location_sharing ?? true,
        lastSeenAt: profile.last_seen_at,
        digitalIdStatus: digitalId?.status || 'pending',
        digitalIdExpires: digitalId?.expires_at || null,
        qrCodeUrl: digitalId?.qr_code_url || null,
        emergencyContactsCount: contactsCount || 0,
        verifiedDocumentsCount: documentsCount || 0,
      })
    } catch (error) {
      console.error("Auth fetchUser error:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUser()
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, "Session exists:", !!session)
      fetchUser()
    })
    return () => {
      sub.subscription?.unsubscribe()
    }
  }, [supabase, fetchUser])

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      if (!emailOrPhone.includes("@")) {
        // For now, only email+password is supported in UI; phone login would need OTP flow.
        throw new Error("Please sign in with email and password")
      }
      const { error } = await supabase.auth.signInWithPassword({ email: emailOrPhone, password })
      if (error) throw error
      await fetchUser()
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const completeProfile = async (profileData: {
    full_name: string
    phone?: string
    nationality?: string
    emergencyContacts?: any[]
    idDocuments?: any[]
  }) => {
    try {
  const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        console.error("No authenticated user found")
        return false
      }

      console.log("Creating profile for authenticated user:", session.user.id)
      
      // Create profile with only existing columns from schema
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: session.user.id,
          email: session.user.email ?? '',
          full_name: profileData.full_name ?? '',
          phone: profileData.phone || null,
          nationality: profileData.nationality || 'Unknown'
        } as any, { onConflict: 'user_id' })
      
      if (profileError) {
        console.error("Profile creation error:", profileError)
        console.error("Error details:", JSON.stringify(profileError, null, 2))
        return false
      }
      
      console.log("Profile created successfully")
      
      // Create digital ID
      const tssId = `TSS-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      const { error: digitalIdError } = await supabase.from("digital_ids").insert({
        user_id: session.user.id,
        tss_id: tssId,
        status: 'pending' as any,
        verification_level: 'unverified' as any,
        expires_at: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      } as any)
      
      if (digitalIdError) {
        console.error("Digital ID creation error:", digitalIdError)
      } else {
        console.log("Digital ID created successfully")
      }
      
      // Add emergency contacts if provided
      if (Array.isArray(profileData.emergencyContacts) && profileData.emergencyContacts.length) {
        const toEnum = (raw: string): string => {
          if (!raw) return 'other'
          const s = String(raw).toLowerCase().trim()
          if (["parent","father","mother","dad","mom"].includes(s)) return 'parent'
          if (["spouse","wife","husband","partner"].includes(s)) return 'spouse'
          if (["sibling","brother","sister"].includes(s)) return 'sibling'
          if (["child","son","daughter"].includes(s)) return 'child'
          if (["friend","best friend","bff"].includes(s)) return 'friend'
          if (["colleague","coworker","co-worker","work"].includes(s)) return 'colleague'
          if (["guardian","caretaker","caregiver"].includes(s)) return 'guardian'
          if (["relative","family","cousin","uncle","aunt","grandparent","grandfather","grandmother"].includes(s)) return 'relative'
          return 'other'
        }

        const contacts = profileData.emergencyContacts
          .filter((c: any) => c?.name && c?.phone)
          .slice(0, 5)
          .map((c: any, idx: number) => ({
            user_id: session.user.id,
            name: c.name,
            email: c.email || null,
            phone: c.phone,
            relationship: toEnum(c.relationship),
            is_primary: idx === 0,
            priority: idx + 1,
          }))

        if (contacts.length) {
          console.log("Inserting emergency contacts:", contacts.length)
          const { error: contactError } = await supabase.from("emergency_contacts").insert(contacts as any)
          if (contactError) {
            console.error("Emergency contacts error:", contactError)
          } else {
            console.log("Emergency contacts inserted successfully")
          }
        }
      }
      
      // Refresh user data
      await fetchUser()
      return true
      
    } catch (error) {
      console.error("Complete profile error:", error)
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true)
      const { email, password, name, phone, nationality } = userData
      if (!email || !password) throw new Error("Email and password are required")

      console.log("Starting registration for:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: name,
            phone: phone,
            nationality: nationality 
          },
        },
      })
      if (error) {
        console.error("Signup error:", error)
        throw error
      }

      console.log("Auth signup successful:", data.user?.id, "Session:", !!data.session)

      // Check if we have immediate session (email confirmation disabled)
      if (data.user && data.session) {
        console.log("Session exists immediately - email confirmation is disabled, creating profile and digital ID...")
        
        // Create profile with only existing columns from schema
        console.log("Creating profile for user:", data.user.id)
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            user_id: data.user.id,
            email: email,
            full_name: name || '',
            phone: phone || null,
            nationality: nationality || 'Unknown'
          } as any, { onConflict: 'user_id' })
        
        if (profileError) {
          console.error("Profile creation error:", profileError)
          console.error("Error details:", JSON.stringify(profileError, null, 2))
          return false
        } else {
          console.log("Profile created successfully")
        }
        
        // Create digital ID
        const tssId = `TSS-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        const { error: digitalIdError } = await supabase.from("digital_ids").insert({
          user_id: data.user.id,
          tss_id: tssId,
          status: 'pending' as any,
          verification_level: 'unverified' as any,
          expires_at: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 2 years
        } as any)
        
        if (digitalIdError) {
          console.error("Digital ID creation error:", digitalIdError)
        } else {
          console.log("Digital ID created successfully")
        }
        
        // Insert emergency contacts (sanitize relationship to match enum)
        if (Array.isArray(userData.emergencyContacts) && userData.emergencyContacts.length) {
          const toEnum = (raw: string): string => {
            if (!raw) return 'other'
            const s = String(raw).toLowerCase().trim()
            if (["parent","father","mother","dad","mom"].includes(s)) return 'parent'
            if (["spouse","wife","husband","partner"].includes(s)) return 'spouse'
            if (["sibling","brother","sister"].includes(s)) return 'sibling'
            if (["child","son","daughter"].includes(s)) return 'child'
            if (["friend","best friend","bff"].includes(s)) return 'friend'
            if (["colleague","coworker","co-worker","work"].includes(s)) return 'colleague'
            if (["guardian","caretaker","caregiver"].includes(s)) return 'guardian'
            if (["relative","family","cousin","uncle","aunt","grandparent","grandfather","grandmother"].includes(s)) return 'relative'
            return 'other'
          }

          // extra safety: ensure profile row exists before inserting contacts (FK)
          const { data: profileExists } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', data.user.id)
            .limit(1)

          if (!profileExists || profileExists.length === 0) {
            console.warn('Skipping contacts insert because profile row not found yet')
          } else {
            const contacts = userData.emergencyContacts
              .filter((c: any) => c?.name && c?.phone)
              .slice(0, 5) // Limit to 5 contacts
              .map((c: any, idx: number) => ({
                user_id: data.user!.id,
                name: c.name,
                email: c.email || null,
                phone: c.phone,
                relationship: toEnum(c.relationship),
                is_primary: idx === 0, // First contact is primary
                // priority defaults to 1 in schema; we can set for clarity
                priority: idx + 1,
              }))

            if (contacts.length) {
              console.log("Inserting emergency contacts:", contacts.length, contacts)
              const { error: contactError } = await supabase.from("emergency_contacts").insert(contacts as any)
              if (contactError) {
                console.error("Emergency contacts error:", contactError)
              } else {
                console.log("Emergency contacts inserted successfully")
              }
            }
          }
        }

        // Upload identity documents to Storage and insert rows
        if (Array.isArray(userData.idDocuments) && userData.idDocuments.length) {
          for (const doc of userData.idDocuments) {
            if (!doc?.type || !doc?.number) continue
            console.log("Processing document:", doc.type, doc.number)
            
            let file_url: string | null = null
            if (doc.file instanceof File) {
              const path = `${data.user.id}/${Date.now()}_${doc.file.name}`
              console.log("Uploading file to:", path)
              const { error: upErr } = await supabase.storage
                .from('id-documents')
                .upload(path, doc.file, {
                  cacheControl: '3600',
                  upsert: false,
                })
              if (upErr) {
                console.error("File upload error:", upErr)
              } else {
                file_url = path
                console.log("File uploaded successfully")
              }
            }
            
            console.log("Inserting document record...")
            const { error: docError } = await supabase.from('id_documents').insert({
              user_id: data.user.id,
              document_type: doc.type,
              document_number: doc.number,
              file_url: file_url,
              issuing_country: userData.nationality || 'Unknown',
              issue_date: doc.issueDate || new Date().toISOString().split('T')[0],
              expiry_date: doc.expiryDate,
            } as any)
            if (docError) {
              console.error("Document insert error:", docError)
            } else {
              console.log("Document inserted successfully")
            }
          }
        }
      } else if (data.user && !data.session) {
        console.log("User created but no session - email confirmation is still enabled in Supabase project settings")
        console.log("Please disable email confirmation in Supabase Dashboard: Authentication > Settings > Email Confirmations")
        // Return success but inform user about email confirmation
        return true
      } else {
        console.log("Registration failed - no user created")
        return false
      }

      // Wait a moment for triggers to complete
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Fetch profile (works whether session exists now or after confirm)
      console.log("Fetching user profile...")
      await fetchUser()
      return true
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      setUser(null)
    }
  }

  const refreshUser = async () => fetchUser()

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, completeProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
