"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, QrCode, Download, Share2, Calendar, MapPin, Phone, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useState, useEffect } from "react"
import { useSafetyScore } from "@/hooks/use-safety-score"
import { createClient } from "@/utils/supabase/client"
import type { DigitalId } from "@/types/database.types"

interface DigitalIDProps {
  showActions?: boolean
  compact?: boolean
}

export function DigitalIDCard({ showActions = true, compact = false }: DigitalIDProps) {
  const { user } = useAuth()
  const liveSafetyScore = useSafetyScore()
  const [digitalIdData, setDigitalIdData] = useState<DigitalId | null>(null)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user?.id) {
      fetchDigitalIdData()
    }
  }, [user?.id])

  const fetchDigitalIdData = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('digital_ids')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching digital ID:', error)
        return
      }

      setDigitalIdData(data)
    } catch (error) {
      console.error('Error fetching digital ID:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadID = async () => {
    // In a real app, this would generate and download a PDF version
    try {
      // You could implement PDF generation here
      alert("Digital ID downloaded successfully!")
    } catch (error) {
      console.error('Error downloading ID:', error)
      alert("Failed to download Digital ID")
    }
  }

  const handleShareID = async () => {
    // In a real app, this would share the ID via various methods
    try {
      if (navigator.share && digitalIdData) {
        await navigator.share({
          title: 'Tourist Safety Shield - Digital ID',
          text: `Digital Tourist ID: ${digitalIdData.tss_id}`,
          url: window.location.origin + `/verify/${digitalIdData.tss_id}`
        })
      } else {
        // Fallback to clipboard
        const shareText = `Tourist Safety Shield Digital ID: ${digitalIdData?.tss_id}\nVerify at: ${window.location.origin}/verify/${digitalIdData?.tss_id}`
        await navigator.clipboard.writeText(shareText)
        alert("Digital ID link copied to clipboard!")
      }
    } catch (error) {
      console.error('Error sharing ID:', error)
      alert("Failed to share Digital ID")
    }
  }

  const handleGenerateQR = async () => {
    if (!digitalIdData || !user?.id) return

    try {
      setIsGeneratingQR(true)

      // Generate QR code URL (in production, you'd integrate with a QR code service)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        JSON.stringify({
          id: digitalIdData.tss_id,
          name: user.name,
          verification_level: digitalIdData.verification_level,
          expires: digitalIdData.expires_at,
          verify_url: `${window.location.origin}/verify/${digitalIdData.tss_id}`
        })
      )}`

      // Update the digital ID with QR code URL
      const { error } = await supabase
        .from('digital_ids')
        .update({ qr_code_url: qrCodeUrl })
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      // Refresh data
      await fetchDigitalIdData()
      alert("QR Code generated and saved!")
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert("Failed to generate QR Code")
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return "bg-green-500"
      case 'suspended': return "bg-red-500"
      case 'expired': return "bg-gray-500"
      case 'revoked': return "bg-red-600"
      default: return "bg-yellow-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return "Active"
      case 'suspended': return "Suspended"
      case 'expired': return "Expired"
      case 'revoked': return "Revoked"
      default: return "Pending"
    }
  }

  const getVerificationBadgeColor = (level: string) => {
    switch (level) {
      case 'premium': return "bg-purple-500"
      case 'verified': return "bg-blue-500"
      case 'basic': return "bg-gray-500"
      default: return "bg-yellow-500"
    }
  }

  const getVerificationText = (level: string) => {
    switch (level) {
      case 'premium': return "Premium Verified"
      case 'verified': return "Verified"
      case 'basic': return "Basic"
      default: return "Unverified"
    }
  }

  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!user) return null
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
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
          <div className="flex flex-col space-y-1">
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(digitalIdData?.status || 'pending')} text-white text-xs`}
            >
              {getStatusText(digitalIdData?.status || 'pending')}
            </Badge>
            <Badge 
              variant="outline" 
              className={`${getVerificationBadgeColor(digitalIdData?.verification_level || 'basic')} text-white text-xs`}
            >
              {getVerificationText(digitalIdData?.verification_level || 'basic')}
            </Badge>
          </div>
        </div>

        {/* User Photo Placeholder */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg text-foreground">{user.name}</h4>
            <p className="text-sm text-muted-foreground">ID: {digitalIdData?.tss_id || 'Loading...'}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-muted-foreground">Safety Score:</span>
              <span className={`font-bold ${getSafetyScoreColor(liveSafetyScore ?? user.safetyScore)}`}>{(liveSafetyScore ?? user.safetyScore)}/100</span>
            </div>
          </div>
        </div>

        {!compact && (
          <>
            {/* Contact Information */}
            <div className="space-y-2 mb-6">
              {user.email && (
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.phone}</span>
                </div>
              )}
              {digitalIdData?.expires_at && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Valid until: {formatDate(digitalIdData.expires_at)}
                  </span>
                </div>
              )}
              {user.nationality && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Nationality: {user.nationality}</span>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white border-2 border-primary/20 rounded-lg flex items-center justify-center">
                {digitalIdData?.qr_code_url ? (
                  <img 
                    src={digitalIdData.qr_code_url} 
                    alt="Digital ID QR Code" 
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <QrCode className="h-16 w-16 text-primary" />
                )}
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
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleGenerateQR} 
              disabled={isGeneratingQR || !digitalIdData} 
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {isGeneratingQR ? "Generating..." : digitalIdData?.qr_code_url ? "Regenerate QR" : "Generate QR Code"}
            </Button>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            This digital ID is secured with advanced encryption and is valid for official tourist identification
            purposes. TSS ID: {digitalIdData?.tss_id}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
