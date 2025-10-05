"use client"

import { Button } from "@/components/ui/button"
import { Shield, Menu, X, User } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-foreground">Tourist Safety Shield</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link href="/digital-id" className="text-muted-foreground hover:text-foreground transition-colors">
                  Digital ID
                </Link>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                  <User className="h-4 w-4 inline mr-1" />
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/digital-id"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Digital ID
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/about"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href="/features"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                  <div className="px-3 py-2">
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Login
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
