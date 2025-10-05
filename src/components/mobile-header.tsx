"use client"

import { Shield, Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface MobileHeaderProps {
  title: string
  showNotifications?: boolean
  showMenu?: boolean
}

export function MobileHeader({ title, showNotifications = true, showMenu = false }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Tourist Safety Shield</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {showNotifications && (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
          )}
          {showMenu && (
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
