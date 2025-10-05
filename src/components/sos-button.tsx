"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Phone } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function SOSButton() {
  const [isActivated, setIsActivated] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { user } = useAuth()

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

  const activateSOS = () => {
    setIsActivated(true)

    // Simulate SOS activation
    alert(
      `SOS ACTIVATED!\n\nEmergency services have been notified.\nYour location has been shared with:\n- Local Police\n- Emergency Contacts\n- Tourist Safety Authority\n\nHelp is on the way!`,
    )

    // Reset after 30 seconds (in real app, this would be handled differently)
    setTimeout(() => {
      setIsActivated(false)
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
