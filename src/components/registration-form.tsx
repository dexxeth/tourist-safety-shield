"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Upload, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

interface IDDocument {
  type: string
  number: string
  file: File | null
}

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    nationality: "",
  })

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: "", phone: "", relationship: "" },
    { name: "", phone: "", relationship: "" },
    { name: "", phone: "", relationship: "" },
  ])

  const [idDocuments, setIdDocuments] = useState<IDDocument[]>([{ type: "", number: "", file: null }])

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEmergencyContactChange = (index: number, field: string, value: string) => {
    setEmergencyContacts((prev) => prev.map((contact, i) => (i === index ? { ...contact, [field]: value } : contact)))
  }

  const addEmergencyContact = () => {
    setEmergencyContacts((prev) => [...prev, { name: "", phone: "", relationship: "" }])
  }

  const removeEmergencyContact = (index: number) => {
    if (emergencyContacts.length > 3) {
      setEmergencyContacts((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleIDDocumentChange = (index: number, field: string, value: string | File) => {
    setIdDocuments((prev) => prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc)))
  }

  const addIDDocument = () => {
    setIdDocuments((prev) => [...prev, { type: "", number: "", file: null }])
  }

  const removeIDDocument = (index: number) => {
    if (idDocuments.length > 1) {
      setIdDocuments((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleFileUpload = (index: number, file: File | null) => {
    setIdDocuments((prev) => prev.map((doc, i) => (i === index ? { ...doc, file } : doc)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      setIsSubmitting(false)
      return
    }

    // Check if at least 3 emergency contacts are filled
    const filledContacts = emergencyContacts.filter((contact) => contact.name && contact.phone && contact.relationship)
    if (filledContacts.length < 3) {
      alert("Please provide at least 3 emergency contacts")
      setIsSubmitting(false)
      return
    }

    try {
      const success = await register({
        ...formData,
        emergencyContacts: filledContacts,
        idDocuments: idDocuments.filter((doc) => doc.type && doc.number),
      })

      if (success) {
        alert("Registration successful! Redirecting to dashboard...")
        router.push("/dashboard")
      } else {
        alert("Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="nationality">Nationality *</Label>
              <Select onValueChange={(value) => handleInputChange("nationality", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="british">British</SelectItem>
                  <SelectItem value="canadian">Canadian</SelectItem>
                  <SelectItem value="australian">Australian</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 9876543210"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
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
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ID Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Identity Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {idDocuments.map((doc, index) => (
            <div key={index} className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Document {index + 1}</h4>
                {idDocuments.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIDDocument(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Document Type *</Label>
                  <Select onValueChange={(value) => handleIDDocumentChange(index, "type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driving_license">Driving License</SelectItem>
                      <SelectItem value="voter_id">Voter ID</SelectItem>
                      <SelectItem value="pan_card">PAN Card</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Document Number *</Label>
                  <Input
                    type="text"
                    value={doc.number}
                    onChange={(e) => handleIDDocumentChange(index, "number", e.target.value)}
                    placeholder="Enter document number"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Upload Document (Photo/PDF) *</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(index, e.target.files?.[0] || null)}
                    className="hidden"
                    id={`file-${index}`}
                  />
                  <Label
                    htmlFor={`file-${index}`}
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {doc.file ? doc.file.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                    </div>
                  </Label>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addIDDocument} className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Document
          </Button>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts (Minimum 3 required)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Contact {index + 1}</h4>
                {emergencyContacts.length > 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmergencyContact(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    type="text"
                    value={contact.name}
                    onChange={(e) => handleEmergencyContactChange(index, "name", e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => handleEmergencyContactChange(index, "phone", e.target.value)}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
                <div>
                  <Label>Relationship *</Label>
                  <Select onValueChange={(value) => handleEmergencyContactChange(index, "relationship", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addEmergencyContact} className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Contact
          </Button>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex flex-col space-y-4">
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  )
}
