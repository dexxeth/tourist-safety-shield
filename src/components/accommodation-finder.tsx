"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Hotel, MapPin, Star, Shield, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { listAccommodations } from "@/lib/data"

interface Accommodation {
  id: string
  name: string
  type: "hotel" | "hostel" | "guesthouse"
  rating: number | null
  safety_score: number | null
  price_text: string | null
  verified: boolean
  amenities: string[] | null
  area: string | null
  city: string | null
}

export function AccommodationFinder() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const rows = await listAccommodations()
        if (!mounted) return
        setAccommodations(rows as unknown as Accommodation[])
      } catch {}
    })()
    return () => {
      mounted = false
    }
  }, [])

  const handleSearch = () => {
    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
      // Filtering/search can be implemented via supabase full-text or LIKE queries later.
    }, 800)
  }

  const handleBooking = (accommodationId: string) => {
    const accommodation = accommodations.find((acc) => acc.id === accommodationId)
    alert(
      `Booking request for ${accommodation?.name}\n\nYou will be redirected to secure booking with verified safety standards.`,
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "hotel":
        return "bg-blue-100 text-blue-800"
      case "hostel":
        return "bg-green-100 text-green-800"
      case "guesthouse":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Hotel className="h-5 w-5 mr-2" />
          Find Accommodation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex space-x-2">
          <Input
            placeholder="Search hotels, hostels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={handleSearch} disabled={isSearching}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Nearby Accommodations */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Nearby Safe Accommodations</h4>
          <div className="space-y-3">
            {accommodations.map((accommodation) => (
              <div key={accommodation.id} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-foreground">{accommodation.name}</h5>
                      {accommodation.verified && <Shield className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getTypeColor(accommodation.type)}>{accommodation.type}</Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm text-muted-foreground">{accommodation.rating ?? "-"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3 text-green-600" />
                        <span className="text-sm text-green-600">{accommodation.safety_score ?? "-"}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {accommodation.area ?? ""}
                      </span>
                      <span className="font-medium text-foreground">{accommodation.price_text ?? ""}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {(accommodation.amenities ?? []).map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={() => handleBooking(accommodation.id)}
                  className="w-full"
                  variant={accommodation.verified ? "default" : "outline"}
                >
                  {accommodation.verified ? "Book Verified Stay" : "View Details"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Notice */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <Shield className="h-4 w-4 inline mr-1 text-primary" />
            All accommodations are verified for tourist safety standards and emergency response capabilities.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
