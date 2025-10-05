"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  digitalId: string
  safetyScore: number
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (emailOrPhone: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: any) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        // In a real app, this would check for valid session/token
        const savedUser = localStorage.getItem("tourist_user")
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data - in real app this would come from API
      const mockUser: User = {
        id: "user_123",
        name: "John Doe",
        email: emailOrPhone.includes("@") ? emailOrPhone : "john.doe@example.com",
        phone: emailOrPhone.includes("@") ? "+91 9876543210" : emailOrPhone,
        digitalId: "TSS-2025-001234",
        safetyScore: 85,
        isVerified: true,
      }

      setUser(mockUser)
      localStorage.setItem("tourist_user", JSON.stringify(mockUser))
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate digital ID
      const digitalId = `TSS-2025-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      const newUser: User = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        digitalId,
        safetyScore: 75, // Initial safety score
        isVerified: false, // Would be verified after document review
      }

      setUser(newUser)
      localStorage.setItem("tourist_user", JSON.stringify(newUser))
      return true
    } catch (error) {
      console.error("Registration failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("tourist_user")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
