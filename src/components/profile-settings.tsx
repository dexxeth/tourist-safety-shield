"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Bell, Lock, Phone, Camera, Trash2, Save, Eye, EyeOff, Plus, Edit } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function ProfileSettings() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    nationality: "Indian",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Emergency contacts state
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: "John Doe", phone: "+91 9876543210", relationship: "Father" },
    { id: 2, name: "Jane Doe", phone: "+91 9876543211", relationship: "Mother" },
    { id: 3, name: "Mike Smith", phone: "+91 9876543212", relationship: "Friend" },
  ])

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

  const handleProfileUpdate = () => {
    // Simulate profile update
    alert("Profile updated successfully!")
    setIsEditing(false)
  }

  const handlePasswordChange = () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      alert("New passwords do not match!")
      return
    }
    alert("Password changed successfully!")
    setProfileData({ ...profileData, currentPassword: "", newPassword: "", confirmPassword: "" })
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
    const newContact = {
      id: Date.now(),
      name: "",
      phone: "",
      relationship: "",
    }
    setEmergencyContacts([...emergencyContacts, newContact])
  }

  const updateEmergencyContact = (id: number, field: string, value: string) => {
    setEmergencyContacts(
      emergencyContacts.map((contact) => (contact.id === id ? { ...contact, [field]: value } : contact)),
    )
  }

  const removeEmergencyContact = (id: number) => {
    setEmergencyContacts(emergencyContacts.filter((contact) => contact.id !== id))
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
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="bg-transparent">
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
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
              <Button onClick={handleProfileUpdate} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
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
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmergencyContact(contact.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, locationTracking: checked })}
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
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, shareWithEmergencyContacts: checked })
                  }
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
