"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, QrCode, Download, Share2, Calendar, MapPin, Phone, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useState } from "react"

interface DigitalIDProps {
  showActions?: boolean
  compact?: boolean
}

export function DigitalIDCard({ showActions = true, compact = false }: DigitalIDProps) {
  const { user } = useAuth()
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  if (!user) return null

  const handleDownloadID = () => {
    // In a real app, this would generate and download a PDF version
    alert("Digital ID downloaded successfully!")
  }

  const handleShareID = () => {
    // In a real app, this would share the ID via various methods
    alert("Digital ID shared successfully!")
  }

  const handleGenerateQR = () => {
    setIsGeneratingQR(true)
    setTimeout(() => {
      setIsGeneratingQR(false)
      alert("QR Code generated and saved!")
    }, 1500)
  }

  const getStatusColor = (isVerified: boolean) => {
    return isVerified ? "bg-green-500" : "bg-yellow-500"
  }

  const getStatusText = (isVerified: boolean) => {
    return isVerified ? "Verified" : "Pending Verification"
  }

  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-bold text-lg text-foreground">Tourist Safety Shield</h3>
              <p className="text-xs text-muted-foreground">Digital Tourist ID</p>
            </div>
          </div>
          <Badge variant="secondary" className={`${getStatusColor(user.isVerified)} text-white`}>
            {getStatusText(user.isVerified)}
          </Badge>
        </div>

        {/* User Photo Placeholder */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg text-foreground">{user.name}</h4>
            <p className="text-sm text-muted-foreground">ID: {user.digitalId}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-muted-foreground">Safety Score:</span>
              <span className={`font-bold ${getSafetyScoreColor(user.safetyScore)}`}>{user.safetyScore}/100</span>
            </div>
          </div>
        </div>

        {!compact && (
          <>
            {/* Contact Information */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Valid until: Dec 31, 2025</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Current Location: Mumbai, India</span>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white border-2 border-primary/20 rounded-lg flex items-center justify-center">
                <QrCode className="h-16 w-16 text-primary" />
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadID} className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareID} className="bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <Button variant="default" size="sm" onClick={handleGenerateQR} disabled={isGeneratingQR} className="w-full">
              <QrCode className="h-4 w-4 mr-2" />
              {isGeneratingQR ? "Generating..." : "Generate QR Code"}
            </Button>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            This digital ID is secured with blockchain technology and is valid for official tourist identification
            purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
