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
import { Filter, MapPin, DollarSign, Calendar, Cigarette, Dog, Moon, Volume2, Heart, X } from "lucide-react"

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
  const [isFilterOpen, setIsFilterOpen] = useState(false)

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
    <div className="space-y-6 p-1">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Enter city or neighborhood..."
            value={filters.location}
            onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Price Range</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => setFilters((prev) => ({ ...prev, priceMin: e.target.value }))}
              className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
            />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => setFilters((prev) => ({ ...prev, priceMax: e.target.value }))}
              className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Lifestyle Preferences</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => toggleLifestylePreference("noSmoking")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
              filters.lifestylePreferences.includes("noSmoking")
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
            }`}
          >
            <Cigarette className="w-4 h-4" />
            <span className="text-sm font-medium">No Smoking</span>
          </button>
          <button
            onClick={() => toggleLifestylePreference("petFriendly")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
              filters.lifestylePreferences.includes("petFriendly")
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
            }`}
          >
            <Dog className="w-4 h-4" />
            <span className="text-sm font-medium">Pet Friendly</span>
          </button>
          <button
            onClick={() => toggleLifestylePreference("quiet")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
              filters.lifestylePreferences.includes("quiet")
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-sm font-medium">Quiet</span>
          </button>
          <button
            onClick={() => toggleLifestylePreference("nightOwl")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
              filters.lifestylePreferences.includes("nightOwl")
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
            }`}
          >
            <Moon className="w-4 h-4" />
            <span className="text-sm font-medium">Night Owl</span>
          </button>
        </div>
      </div>

      <div className="pt-4 space-y-3 border-t border-slate-200">
        <Button
          onClick={() => {
            setFilters({ location: "", priceMin: "", priceMax: "", lifestylePreferences: [] })
            setIsFilterOpen(false)
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 font-medium shadow-sm"
        >
          Apply Filters
        </Button>
        <Button
          variant="ghost"
          onClick={() => setFilters({ location: "", priceMin: "", priceMax: "", lifestylePreferences: [] })}
          className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
        >
          <X className="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
      </div>
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Your Perfect Room</h1>
            <p className="text-slate-600">
              {filteredListings.length} {filteredListings.length === 1 ? "listing" : "listings"} available
            </p>
          </div>

          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="relative border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl px-6 py-6 transition-all shadow-sm bg-transparent"
              >
                <Filter className="h-5 w-5 mr-2 text-slate-600" />
                <span className="font-medium text-slate-700">Filters</span>
                {(filters.location ||
                  filters.priceMin ||
                  filters.priceMax ||
                  filters.lifestylePreferences.length > 0) && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    {
                      [filters.location, filters.priceMin, filters.priceMax, ...filters.lifestylePreferences].filter(
                        Boolean,
                      ).length
                    }
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[400px] bg-white">
              <SheetHeader className="border-b border-slate-200 pb-4">
                <SheetTitle className="text-xl font-bold text-slate-900">Filter Rooms</SheetTitle>
              </SheetHeader>
              <div className="mt-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div>
        {filteredListings.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <div className="space-y-4">
              <div className="text-6xl">🏠</div>
              <h3 className="text-xl font-semibold text-slate-900">No listings found</h3>
              <p className="text-slate-600">Try adjusting your filters to see more results.</p>
              <Button
                variant="outline"
                onClick={() => setFilters({ location: "", priceMin: "", priceMax: "", lifestylePreferences: [] })}
                className="border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl"
              >
                Reset Filters
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className="hover:shadow-xl transition-all border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full"
              >
                <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 transition-all">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-bold text-slate-900 leading-tight">{listing.title}</CardTitle>
                    <Badge
                      variant={listing.status === "OPEN" ? "default" : "secondary"}
                      className={listing.status === "OPEN" ? "bg-emerald-600" : ""}
                    >
                      {listing.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 flex-1">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                    {listing.location}
                  </div>
                  <div className="flex items-center text-xl font-bold text-slate-900">
                    <DollarSign className="h-5 w-5 mr-1 text-emerald-600" />
                    {listing.pricePerMonth}
                    <span className="text-sm font-normal text-slate-500 ml-1">/month</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                    Available {new Date(listing.availableFrom).toLocaleDateString()}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {listing.rules.noSmoking && (
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
                        <Cigarette className="w-3 h-3 mr-1" />
                        No Smoking
                      </Badge>
                    )}
                    {listing.rules.noPet && (
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
                        <Dog className="w-3 h-3 mr-1" />
                        No Pets
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{listing.description}</p>
                </CardContent>
                <CardFooter className="flex gap-2 bg-slate-50 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-200 hover:border-emerald-500 hover:bg-white hover:text-slate-900 rounded-xl bg-transparent"
                    asChild
                  >
                    <Link href={`/listing/${listing.id}`}>View Details</Link>
                  </Button>
                  {listing.status === "OPEN" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                          onClick={() => setSelectedListing(listing.id)}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Interested
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-slate-900">Express Interest</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-slate-600 leading-relaxed">
                            Send a message to the host about why you'd be a great roommate.
                          </p>
                          <Textarea
                            placeholder="Hi! I'm interested in your listing. I'm a clean, responsible person who..."
                            value={interestMessage}
                            onChange={(e) => setInterestMessage(e.target.value)}
                            rows={4}
                            className="border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleExpressInterest(listing.id)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                            >
                              Send Interest
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedListing(null)
                                setInterestMessage("")
                              }}
                              className="border-slate-200 hover:border-slate-300 rounded-xl"
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
  )
}
