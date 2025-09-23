"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Filter, MapPin, DollarSign, Calendar, Cigarette, Dog, Moon, Volume2, Heart } from "lucide-react"

// Mock data
const mockListings = [
  {
    id: "1",
    title: "Cozy Downtown Apartment",
    location: "Downtown Seattle",
    pricePerMonth: 1200,
    status: "OPEN" as const,
    rules: { noSmoking: true, noPet: false },
    availableFrom: "2024-02-01",
    description: "Beautiful 2BR apartment in the heart of downtown with great city views.",
    hostId: "host1",
  },
  {
    id: "2",
    title: "Quiet Suburban Room",
    location: "Bellevue",
    pricePerMonth: 800,
    status: "OPEN" as const,
    rules: { noSmoking: true, noPet: true },
    availableFrom: "2024-01-15",
    description: "Peaceful room in a quiet neighborhood, perfect for students.",
    hostId: "host2",
  },
  {
    id: "3",
    title: "Modern Loft Space",
    location: "Capitol Hill",
    pricePerMonth: 1500,
    status: "CLOSED" as const,
    rules: { noSmoking: false, noPet: false },
    availableFrom: "2024-03-01",
    description: "Trendy loft in vibrant Capitol Hill area.",
    hostId: "host3",
  },
]

export function BrowseListings() {
  const [filters, setFilters] = useState({
    location: "",
    priceMin: "",
    priceMax: "",
    lifestylePreferences: [] as string[],
  })
  const [interestMessage, setInterestMessage] = useState("")
  const [selectedListing, setSelectedListing] = useState<string | null>(null)

  const filteredListings = mockListings.filter((listing) => {
    // Only show OPEN listings
    if (listing.status !== "OPEN") return false
    if (filters.location && !listing.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.priceMin && listing.pricePerMonth < Number.parseInt(filters.priceMin)) return false
    if (filters.priceMax && listing.pricePerMonth > Number.parseInt(filters.priceMax)) return false

    if (filters.lifestylePreferences.length > 0) {
      const hasNoSmoking = filters.lifestylePreferences.includes("noSmoking")
      const hasPetFriendly = filters.lifestylePreferences.includes("petFriendly")

      if (hasNoSmoking && !listing.rules.noSmoking) return false
      if (hasPetFriendly && listing.rules.noPet) return false
    }

    return true
  })

  const toggleLifestylePreference = (preference: string) => {
    setFilters((prev) => ({
      ...prev,
      lifestylePreferences: prev.lifestylePreferences.includes(preference)
        ? prev.lifestylePreferences.filter((p) => p !== preference)
        : [...prev.lifestylePreferences, preference],
    }))
  }

  const FilterPanel = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Location</label>
        <Input
          placeholder="Enter location..."
          value={filters.location}
          onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-medium mb-2 block">Min Price</label>
          <Input
            type="number"
            placeholder="$0"
            value={filters.priceMin}
            onChange={(e) => setFilters((prev) => ({ ...prev, priceMin: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Max Price</label>
          <Input
            type="number"
            placeholder="$5000"
            value={filters.priceMax}
            onChange={(e) => setFilters((prev) => ({ ...prev, priceMax: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Lifestyle Preferences</label>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filters.lifestylePreferences.includes("noSmoking") ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => toggleLifestylePreference("noSmoking")}
          >
            <Cigarette className="w-3 h-3 mr-1" />
            No Smoking
          </Badge>
          <Badge
            variant={filters.lifestylePreferences.includes("petFriendly") ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => toggleLifestylePreference("petFriendly")}
          >
            <Dog className="w-3 h-3 mr-1" />
            Pet Friendly
          </Badge>
          <Badge
            variant={filters.lifestylePreferences.includes("quiet") ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => toggleLifestylePreference("quiet")}
          >
            <Volume2 className="w-3 h-3 mr-1" />
            Quiet
          </Badge>
          <Badge
            variant={filters.lifestylePreferences.includes("nightOwl") ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => toggleLifestylePreference("nightOwl")}
          >
            <Moon className="w-3 h-3 mr-1" />
            Night Owl
          </Badge>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full bg-transparent"
        onClick={() => setFilters({ location: "", priceMin: "", priceMax: "", lifestylePreferences: [] })}
      >
        Reset Filters
      </Button>
    </div>
  )

  const handleExpressInterest = (listingId: string) => {
    console.log("Expressing interest in listing:", listingId, "with message:", interestMessage)
    setInterestMessage("")
    setSelectedListing(null)
    // Show success toast here
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Filters */}
        <div className="hidden lg:block w-80 shrink-0">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilterPanel />
            </CardContent>
          </Card>
        </div>

        {/* Mobile Filters */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full mb-4 bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Listings Grid */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold font-space-grotesk mb-2">Find Your Perfect Room</h1>
            <p className="text-muted-foreground">
              {filteredListings.length} {filteredListings.length === 1 ? "listing" : "listings"} available
            </p>
          </div>

          {filteredListings.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <div className="text-4xl">🏠</div>
                <h3 className="text-xl font-semibold">No listings found</h3>
                <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
                <Button
                  variant="outline"
                  onClick={() => setFilters({ location: "", priceMin: "", priceMax: "", lifestylePreferences: [] })}
                >
                  Reset Filters
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-space-grotesk">{listing.title}</CardTitle>
                      <Badge variant={listing.status === "OPEN" ? "default" : "secondary"}>{listing.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {listing.location}
                    </div>
                    <div className="flex items-center text-lg font-semibold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {listing.pricePerMonth}/month
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      Available from {new Date(listing.availableFrom).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      {listing.rules.noSmoking && (
                        <Badge variant="outline" className="text-xs">
                          <Cigarette className="w-3 h-3 mr-1" />
                          No Smoking
                        </Badge>
                      )}
                      {listing.rules.noPet && (
                        <Badge variant="outline" className="text-xs">
                          <Dog className="w-3 h-3 mr-1" />
                          No Pets
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                      <Link href={`/listing/${listing.id}`}>View Details</Link>
                    </Button>
                    {listing.status === "OPEN" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex-1" onClick={() => setSelectedListing(listing.id)}>
                            <Heart className="h-4 w-4 mr-1" />
                            I'm Interested
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Express Interest</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Send a message to the host about why you'd be a great roommate.
                            </p>
                            <Textarea
                              placeholder="Hi! I'm interested in your listing. I'm a clean, responsible person who..."
                              value={interestMessage}
                              onChange={(e) => setInterestMessage(e.target.value)}
                              rows={4}
                            />
                            <div className="flex gap-2">
                              <Button onClick={() => handleExpressInterest(listing.id)} className="flex-1">
                                Send Interest
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedListing(null)
                                  setInterestMessage("")
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
