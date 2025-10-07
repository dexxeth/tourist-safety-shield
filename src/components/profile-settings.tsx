"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { User, Shield, Bell, Lock, Phone, Camera, Trash2, Save, Eye, EyeOff, Plus, Edit } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { createClient as createSupabaseBrowserClient } from "@/utils/supabase/client"

type EmergencyContact = {
  id: string
  name: string
  phone: string
  relationship: string
  is_primary?: boolean
  _local?: boolean // not yet persisted
}

const toRelationshipEnum = (raw: string): string => {
  if (!raw) return "other"
  const s = String(raw).toLowerCase().trim()
  if (["parent","father","mother","dad","mom"].includes(s)) return "parent"
  if (["spouse","wife","husband","partner"].includes(s)) return "spouse"
  if (["sibling","brother","sister"].includes(s)) return "sibling"
  if (["child","son","daughter"].includes(s)) return "child"
  if (["friend","best friend","bff"].includes(s)) return "friend"
  if (["colleague","coworker","co-worker","work"].includes(s)) return "colleague"
  if (["guardian","caretaker","caregiver"].includes(s)) return "guardian"
  if (["relative","family","cousin","uncle","aunt","grandparent","grandfather","grandmother"].includes(s)) return "relative"
  return "other"
}

export function ProfileSettings() {
  const { user, logout } = useAuth()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [originalProfileData, setOriginalProfileData] = useState<any | null>(null)

  // No preferences JSON in current DB schema; use explicit columns only

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: (user?.email as string) || "",
    phone: (user?.phone as string) || "",
    nationality: "indian",
    dateOfBirth: "",
    gender: "",
    address: "",
    preferredLanguage: "",
    medicalInfo: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Emergency contacts state
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    locationTracking: true,
    shareWithEmergencyContacts: true,
    shareWithAuthorities: true,
    publicProfile: false,
    dataCollection: true,
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    safetyAlerts: true,
    routeUpdates: true,
    emergencyNotifications: true,
    marketingEmails: false,
    smsAlerts: true,
    pushNotifications: true,
  })

  const loadProfile = useCallback(async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      // Load profile row
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("full_name, email, phone, nationality, location_sharing, emergency_sharing, date_of_birth, languages, gender, address, emergency_medical_info")
        .eq("user_id", user.id)
        .limit(1)
      if (pErr) throw pErr
      const p = profiles?.[0] as any
      if (p) {
        setProfileData(prev => ({
          ...prev,
          name: p.full_name ?? user.name ?? "",
          email: p.email ?? (user.email as string) ?? "",
          phone: p.phone ?? (user.phone as string) ?? "",
          nationality: (p.nationality || "indian").toLowerCase(),
          dateOfBirth: p.date_of_birth || "",
          preferredLanguage: (typeof p.languages === 'string' ? p.languages : Array.isArray(p.languages) ? (p.languages[0] ?? '') : '') || "",
          gender: p.gender ?? "",
          address: typeof p.address === 'string' ? p.address : p.address ? JSON.stringify(p.address) : "",
          medicalInfo: p.emergency_medical_info ?? "",
        }))
        setPrivacySettings(prev => ({
          ...prev,
          locationTracking: Boolean(p.location_sharing ?? true),
          shareWithEmergencyContacts: Boolean(p.emergency_sharing ?? true),
        }))
      }

      // Load emergency contacts
      const { data: contacts, error: cErr } = await supabase
        .from("emergency_contacts")
        .select("id,name,phone,relationship,is_primary,created_at")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true })
      if (cErr) throw cErr
      setEmergencyContacts(((contacts || []) as any[]).map((c) => ({
        id: c.id as string,
        name: c.name as string,
        phone: c.phone as string,
        relationship: c.relationship as string,
        is_primary: c.is_primary as boolean,
      })))
    } catch (e) {
      console.error("Load profile error:", e)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleProfileUpdate = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      // Optionally update auth email if changed
      if (profileData.email && profileData.email !== user.email) {
        const { error: emailErr } = await supabase.auth.updateUser({ email: profileData.email })
        if (emailErr) {
          console.warn("Auth email update failed:", emailErr.message)
        }
      }
      // Update profiles table using explicit columns only (no preferences JSON)
      const updatePayload: any = {
        full_name: profileData.name,
        phone: profileData.phone || null,
        nationality: (profileData.nationality || "indian").toLowerCase(),
        email: profileData.email || undefined,
        date_of_birth: profileData.dateOfBirth || null,
        languages: profileData.preferredLanguage || null,
        gender: profileData.gender || null,
        address: profileData.address || null,
        emergency_medical_info: profileData.medicalInfo || null,
      }

      const { error: upErr } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("user_id", user.id)
      if (upErr) throw upErr
      // feedback via toast is handled by caller
      setIsEditing(false)
      await loadProfile()
    } catch (e: any) {
      console.error("Profile update error:", e)
      toast({ title: 'Failed to update profile', description: e?.message || String(e) })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      alert("New passwords do not match!")
      return
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: profileData.newPassword })
      if (error) throw error
      alert("Password changed successfully!")
      setProfileData({ ...profileData, currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (e: any) {
      console.error("Password change error:", e)
      alert(`Failed to change password: ${e?.message || e}`)
    }
  }

  const handleDeleteAccount = () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will remove all your data including your digital tourist ID.",
    )
    if (confirmed) {
      alert("Account deletion initiated. You will receive a confirmation email within 24 hours.")
    }
  }

  const addEmergencyContact = () => {
    const newContact: EmergencyContact = {
      id: `local-${Date.now()}`,
      name: "",
      phone: "",
      relationship: "other",
      _local: true,
    }
    setEmergencyContacts([...emergencyContacts, newContact])
  }

  const updateEmergencyContact = (id: string, field: string, value: string) => {
    setEmergencyContacts(
      emergencyContacts.map((contact) => (contact.id === id ? { ...contact, [field]: value } : contact)),
    )
  }

  const removeEmergencyContact = async (id: string) => {
    if (String(id).startsWith("local-")) {
      setEmergencyContacts(emergencyContacts.filter((c) => c.id !== id))
      return
    }
    try {
      const { error } = await supabase.from("emergency_contacts").delete().eq("id", id)
      if (error) throw error
      setEmergencyContacts(emergencyContacts.filter((c) => c.id !== id))
    } catch (e: any) {
      console.error("Delete contact error:", e)
      alert(`Failed to delete contact: ${e?.message || e}`)
    }
  }

  const saveEmergencyContact = async (contact: EmergencyContact) => {
    if (!user?.id) return
    if (!contact.name || !contact.phone) {
      alert("Please fill name and phone")
      return
    }
    try {
      if (String(contact.id).startsWith("local-")) {
        // Insert
        const { data, error } = await supabase
          .from("emergency_contacts")
          .insert({
            user_id: user.id,
            name: contact.name,
            phone: contact.phone,
            email: "",
            relationship: toRelationshipEnum(contact.relationship),
            is_primary: false,
          })
          .select("id")
          .single()
        if (error) throw error
        setEmergencyContacts((prev) => prev.map((c) => (c.id === contact.id ? { ...contact, id: data!.id as string, _local: false } : c)))
      } else {
        // Update
        const { error } = await supabase
          .from("emergency_contacts")
          .update({
            name: contact.name,
            phone: contact.phone,
            relationship: toRelationshipEnum(contact.relationship),
          })
          .eq("id", contact.id as string)
        if (error) throw error
      }
      alert("Contact saved")
    } catch (e: any) {
      console.error("Save contact error:", e)
      alert(`Failed to save contact: ${e?.message || e}`)
    }
  }

  const updatePrivacyFlag = async (key: "locationTracking" | "shareWithEmergencyContacts", value: boolean) => {
    setPrivacySettings({ ...privacySettings, [key]: value })
    try {
      if (!user?.id) return
      const payload: any = {}
      if (key === "locationTracking") payload.location_sharing = value
      if (key === "shareWithEmergencyContacts") payload.emergency_sharing = value
      const { error } = await supabase.from("profiles").update(payload).eq("user_id", user.id)
      if (error) throw error
    } catch (e: any) {
      console.error("Update privacy error:", e)
      alert(`Failed to update setting: ${e?.message || e}`)
    }
  }

  if (!user) return null

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!isEditing) setOriginalProfileData(profileData)
                  setIsEditing(!isEditing)
                }}
                className="bg-transparent"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}
            {!isLoading && (
            <>
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">
                  {(user.name || "?")
                    .split(" ")
                    .map((n: string) => (n && n[0]) || "")
                    .join("")
                    .toUpperCase() || "?"}
                </span>
              </div>
              <div>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Your full legal name"
                />
              </div>
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Select
                  value={profileData.nationality}
                  onValueChange={(value) => setProfileData({ ...profileData, nationality: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indian">Indian</SelectItem>
                    <SelectItem value="american">American</SelectItem>
                    <SelectItem value="british">British</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Include country code if needed"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={profileData.gender}
                  onValueChange={(value) => setProfileData({ ...profileData, gender: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non_binary">Non-binary</SelectItem>
                    <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Street, City, State, Country"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="preferred-language">Preferred Language</Label>
                <Select
                  value={profileData.preferredLanguage}
                  onValueChange={(value) => setProfileData({ ...profileData, preferredLanguage: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="medical-info">Emergency Medical Info</Label>
              <Textarea
                id="medical-info"
                placeholder="Allergies, medications, conditions, blood type, emergency notes"
                value={profileData.medicalInfo}
                onChange={(e) => setProfileData({ ...profileData, medicalInfo: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            {/* Digital ID Info */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Digital Tourist ID</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ID: {user.digitalId}</p>
                  <p className="text-sm text-muted-foreground">Safety Score: {user.safetyScore}/100</p>
                </div>
                <Badge
                  variant={user.isVerified ? "default" : "secondary"}
                  className={user.isVerified ? "bg-green-500" : ""}
                >
                  {user.isVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-transparent w-1/3"
                  onClick={() => {
                    if (originalProfileData) setProfileData(originalProfileData)
                    setIsEditing(false)
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    const emailValid = !profileData.email || /.+@.+\..+/.test(profileData.email)
                    if (!emailValid) {
                      toast({ title: 'Invalid email', description: 'Please enter a valid email address.' })
                      return
                    }
                    await handleProfileUpdate()
                    toast({ title: 'Profile updated', description: 'Your changes have been saved.' })
                  }}
                  className="w-2/3"
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
            </>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Emergency Contacts
              </div>
              <Button variant="outline" size="sm" onClick={addEmergencyContact} className="bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {emergencyContacts.length === 0 && (
              <div className="p-4 border border-dashed rounded-lg text-sm text-muted-foreground">
                You haven’t added any emergency contacts yet.
              </div>
            )}
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="border border-border rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    placeholder="Name"
                    value={contact.name}
                    onChange={(e) => updateEmergencyContact(contact.id, "name", e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    value={contact.phone}
                    onChange={(e) => updateEmergencyContact(contact.id, "phone", e.target.value)}
                  />
                  <Select
                    value={contact.relationship}
                    onValueChange={(value) => updateEmergencyContact(contact.id, "relationship", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="relative">Relative</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      onClick={() => saveEmergencyContact(contact)}
                      disabled={!contact.name || !contact.phone}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    {contact.is_primary ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Primary</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                        onClick={async () => {
                          if (!user?.id) return
                          try {
                            await supabase.from('emergency_contacts').update({ is_primary: false }).eq('user_id', user.id)
                            await supabase.from('emergency_contacts').update({ is_primary: true }).eq('id', contact.id)
                            toast({ title: 'Primary contact updated' })
                            const { data: contacts } = await supabase
                              .from('emergency_contacts')
                              .select('id,name,phone,relationship,is_primary,created_at')
                              .eq('user_id', user.id)
                              .order('is_primary', { ascending: false })
                              .order('created_at', { ascending: true })
                            setEmergencyContacts(((contacts || []) as any[]).map((c) => ({ id: c.id, name: c.name, phone: c.phone, relationship: c.relationship, is_primary: c.is_primary })))
                          } catch (e: any) {
                            console.error(e)
                            toast({ title: 'Failed to set primary', description: e?.message || String(e) })
                          }
                        }}
                      >
                        Make Primary
                      </Button>
                    )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const confirmed = confirm('Remove this contact?')
                      if (confirmed) removeEmergencyContact(contact.id)
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Privacy Tab */}
      <TabsContent value="privacy" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="location-tracking">Location Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow real-time location tracking for safety monitoring
                  </p>
                </div>
                <Switch
                  id="location-tracking"
                  checked={privacySettings.locationTracking}
                  onCheckedChange={(checked) => updatePrivacyFlag("locationTracking", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="share-emergency">Share with Emergency Contacts</Label>
                  <p className="text-sm text-muted-foreground">Share location with emergency contacts during alerts</p>
                </div>
                <Switch
                  id="share-emergency"
                  checked={privacySettings.shareWithEmergencyContacts}
                  onCheckedChange={(checked) => updatePrivacyFlag("shareWithEmergencyContacts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="share-authorities">Share with Authorities</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow authorities to access your location during emergencies
                  </p>
                </div>
                <Switch
                  id="share-authorities"
                  checked={privacySettings.shareWithAuthorities}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, shareWithAuthorities: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public-profile">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to other verified tourists</p>
                </div>
                <Switch
                  id="public-profile"
                  checked={privacySettings.publicProfile}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, publicProfile: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-collection">Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous data collection for safety improvements
                  </p>
                </div>
                <Switch
                  id="data-collection"
                  checked={privacySettings.dataCollection}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, dataCollection: checked })}
                />
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Data Protection</h4>
              <p className="text-sm text-muted-foreground">
                All your data is encrypted and stored securely. We comply with international data protection laws and
                never sell your personal information.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notifications Tab */}
      <TabsContent value="notifications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="safety-alerts">Safety Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts about safety risks in your area</p>
                </div>
                <Switch
                  id="safety-alerts"
                  checked={notificationSettings.safetyAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, safetyAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="route-updates">Route Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notifications about safer route suggestions</p>
                </div>
                <Switch
                  id="route-updates"
                  checked={notificationSettings.routeUpdates}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, routeUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emergency-notifications">Emergency Notifications</Label>
                  <p className="text-sm text-muted-foreground">Critical emergency alerts (cannot be disabled)</p>
                </div>
                <Switch id="emergency-notifications" checked={true} disabled />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-alerts">SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive important alerts via SMS</p>
                </div>
                <Switch
                  id="sms-alerts"
                  checked={notificationSettings.smsAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, smsAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about new features and services</p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, marketingEmails: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Tab */}
      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Change Password */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Change Password</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                  />
                </div>
                <Button onClick={handlePasswordChange} className="w-full">
                  Update Password
                </Button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">SMS Authentication</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Enable
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Active Sessions</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Current Device</p>
                    <p className="text-xs text-muted-foreground">Chrome on Windows • Mumbai, India</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-4">
              <h4 className="font-medium text-destructive">Danger Zone</h4>
              <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-foreground">Delete Account</h5>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>

            {/* Logout */}
            <Button variant="outline" onClick={logout} className="w-full bg-transparent">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
