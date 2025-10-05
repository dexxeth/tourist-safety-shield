"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Hotel, MapPin, Star, Shield, Search } from "lucide-react"
import { useState } from "react"

interface Accommodation {
  id: string
  name: string
  type: "hotel" | "hostel" | "guesthouse"
  rating: number
  safetyScore: number
  distance: string
  price: string
  verified: boolean
  amenities: string[]
}

export function AccommodationFinder() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const nearbyAccommodations: Accommodation[] = [
    {
      id: "acc1",
      name: "The Taj Mahal Palace",
      type: "hotel",
      rating: 4.8,
      safetyScore: 95,
      distance: "0.5 km",
      price: "₹15,000/night",
      verified: true,
      amenities: ["24/7 Security", "CCTV", "Tourist Police Contact"],
    },
    {
      id: "acc2",
      name: "Backpacker Panda",
      type: "hostel",
      rating: 4.2,
      safetyScore: 82,
      distance: "1.2 km",
      price: "₹800/night",
      verified: true,
      amenities: ["Lockers", "Security Guard", "Safe Area"],
    },
    {
      id: "acc3",
      name: "Sea View Guest House",
      type: "guesthouse",
      rating: 4.0,
      safetyScore: 78,
      distance: "0.8 km",
      price: "₹2,500/night",
      verified: false,
      amenities: ["Basic Security", "Tourist Area"],
    },
  ]

  const handleSearch = () => {
    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
      alert(
        `Searching for accommodations: "${searchQuery}"\n\nResults will be filtered by safety score and verification status.`,
      )
    }, 1500)
  }

  const handleBooking = (accommodationId: string) => {
    const accommodation = nearbyAccommodations.find((acc) => acc.id === accommodationId)
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
            {nearbyAccommodations.map((accommodation) => (
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
                        <span className="text-sm text-muted-foreground">{accommodation.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3 text-green-600" />
                        <span className="text-sm text-green-600">{accommodation.safetyScore}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {accommodation.distance}
                      </span>
                      <span className="font-medium text-foreground">{accommodation.price}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {accommodation.amenities.map((amenity, index) => (
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
