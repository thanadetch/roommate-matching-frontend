"use client"

import { useMemo, useState, memo, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { roommateMatchingApi, roomsApi, tokenStorage, jwt } from "@/lib/api-client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Filter, MapPin, DollarSign, Cigarette, Dog, Moon, Volume2, X } from "lucide-react"

type BrowseFilters = {
  location: string
  priceMin: string
  priceMax: string
  lifestylePreferences: string[]
}

const FilterPanel = memo(
  ({
    draftFilters,
    onLocationChange,
    onPriceMinChange,
    onPriceMaxChange,
    onToggleLifestyle,
    onApply,
    onReset,
    onClose,
  }: {
    draftFilters: BrowseFilters
    onLocationChange: (value: string) => void
    onPriceMinChange: (value: string) => void
    onPriceMaxChange: (value: string) => void
    onToggleLifestyle: (preference: string) => void
    onApply: () => void
    onReset: () => void
    onClose: () => void
  }) => {
    return (
      <div className="space-y-6 p-1">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Enter city or neighborhood..."
              value={draftFilters.location}
              onChange={(e) => onLocationChange(e.target.value)}
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
                value={draftFilters.priceMin}
                onChange={(e) => onPriceMinChange(e.target.value)}
                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
              />
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="number"
                placeholder="Max"
                value={draftFilters.priceMax}
                onChange={(e) => onPriceMaxChange(e.target.value)}
                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Lifestyle Preferences</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onToggleLifestyle("noSmoking")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                draftFilters.lifestylePreferences.includes("noSmoking")
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
              }`}
            >
              <Cigarette className="w-4 h-4" />
              <span className="text-sm font-medium">No Smoking</span>
            </button>

            <button
              onClick={() => onToggleLifestyle("noPets")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                draftFilters.lifestylePreferences.includes("noPets")
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
              }`}
            >
              <Dog className="w-4 h-4" />
              <span className="text-sm font-medium">No Pets</span>
            </button>

            <button
              onClick={() => onToggleLifestyle("quiet")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                draftFilters.lifestylePreferences.includes("quiet")
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-sm font-medium">Quiet</span>
            </button>

            <button
              onClick={() => onToggleLifestyle("nightOwl")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                draftFilters.lifestylePreferences.includes("nightOwl")
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
            onClick={onApply}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 font-medium shadow-sm"
          >
            Apply Filters
          </Button>

          <Button
            variant="ghost"
            onClick={onReset}
            className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-4 h-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>
    )
  },
)

FilterPanel.displayName = "FilterPanel"

export function BrowseListings() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [draftFilters, setDraftFilters] = useState<BrowseFilters>({
    location: "",
    priceMin: "",
    priceMax: "",
    lifestylePreferences: [],
  })
  const [appliedFilters, setAppliedFilters] = useState<BrowseFilters>({
    location: "",
    priceMin: "",
    priceMax: "",
    lifestylePreferences: [],
  })

  const [interestMessage, setInterestMessage] = useState("")
  const [openDialogFor, setOpenDialogFor] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const params = useMemo(() => {
    const p: any = {}
    if (appliedFilters.location) p.location = appliedFilters.location
    if (appliedFilters.priceMin) p.priceMin = Number(appliedFilters.priceMin)
    if (appliedFilters.priceMax) p.priceMax = Number(appliedFilters.priceMax)

    // Send each lifestyle preference as individual boolean field
    if (appliedFilters.lifestylePreferences.includes("noSmoking")) p.noSmoking = true
    if (appliedFilters.lifestylePreferences.includes("noPets")) p.noPets = true
    if (appliedFilters.lifestylePreferences.includes("quiet")) p.quiet = true
    if (appliedFilters.lifestylePreferences.includes("nightOwl")) p.nightOwl = true

    return p
  }, [appliedFilters])

  const { data, isLoading, isError } = useQuery({
    queryKey: ["rooms.browse", params],
    queryFn: () => {
      console.log("[v0] Calling roomsApi.browse with params:", params)
      return roomsApi.browse(params)
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })

  const listings = Array.isArray(data) ? data : (data?.results ?? [])

  const filteredListings = listings.filter((listing: any) => {
  // Price filter
  const minPrice = appliedFilters.priceMin ? Number(appliedFilters.priceMin) : 0
  const maxPrice = appliedFilters.priceMax ? Number(appliedFilters.priceMax) : Infinity
  if (listing.pricePerMonth < minPrice || listing.pricePerMonth > maxPrice) return false

  // Lifestyle filter
  if (appliedFilters.lifestylePreferences.includes("noSmoking") && !listing.noSmoking) return false
  if (appliedFilters.lifestylePreferences.includes("noPets") && !listing.noPets) return false
  if (appliedFilters.lifestylePreferences.includes("quiet") && !listing.quiet) return false
  if (appliedFilters.lifestylePreferences.includes("nightOwl") && !listing.nightOwl) return false

  return true
})

    const handleLocationChange = (value: string) => {
    setDraftFilters((prev) => ({ ...prev, location: value }))
  }

  const handlePriceMinChange = (value: string) => {
    setDraftFilters((prev) => ({ ...prev, priceMin: value }))
  }

  const handlePriceMaxChange = (value: string) => {
    setDraftFilters((prev) => ({ ...prev, priceMax: value }))
  }

  const handleToggleLifestyle = (preference: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      lifestylePreferences: prev.lifestylePreferences.includes(preference)
        ? prev.lifestylePreferences.filter((p) => p !== preference)
        : [...prev.lifestylePreferences, preference],
    }))
  }

  const handleApplyFilters = () => {
    setAppliedFilters({ ...draftFilters }) // สร้าง object ใหม่
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    const reset: BrowseFilters = { location: "", priceMin: "", priceMax: "", lifestylePreferences: [] }
    setDraftFilters(reset)
    setAppliedFilters(reset)
  }


  const handleExpressInterest = async (listingId: string) => {
    try {
      setIsSubmitting(true)
      const token = tokenStorage.get()
      const payload = token ? jwt.decode(token) : null
      const seekerId = payload?.sub || payload?.id
      if (!seekerId) return console.error("User not authenticated")

      const listing = listings.find((l: any) => l.id === listingId)
      if (!listing || !listing.hostId) return console.error("Listing or hostId not found")

      await roommateMatchingApi.createInterest({
        roomId: listingId,
        hostId: listing.hostId,
        seekerId,
        message: interestMessage || undefined,
      })
      setInterestMessage("")
      setOpenDialogFor(null)
      queryClient.invalidateQueries({ queryKey: ["interests.list"] })
    } catch (e) {
      console.error("Failed to send interest:", e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Your Perfect Room</h1>
            <p className="text-slate-600">
              {isLoading ? "Loading..." : isError ? "Failed to load" : `${listings.length} listing(s) available`}
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
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[400px] bg-white">
              <SheetHeader className="border-b border-slate-200 pb-4">
                <SheetTitle className="text-xl font-bold text-slate-900">Filter Rooms</SheetTitle>
              </SheetHeader>
              <div className="mt-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                <FilterPanel
                  draftFilters={draftFilters}
                  onLocationChange={handleLocationChange}
                  onPriceMinChange={handlePriceMinChange}
                  onPriceMaxChange={handlePriceMaxChange}
                  onToggleLifestyle={handleToggleLifestyle}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                  onClose={() => setIsFilterOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {!isLoading && !isError && listings.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <h3 className="text-xl font-semibold text-slate-900">No listings found</h3>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing: any) => {
            const lifestylePrefs = []
            if (listing.noSmoking) lifestylePrefs.push({ icon: Cigarette, label: "No Smoking" })
            if (listing.noPets) lifestylePrefs.push({ icon: Dog, label: "No Pets" })
            if (listing.quiet) lifestylePrefs.push({ icon: Volume2, label: "Quiet" })
            if (listing.nightOwl) lifestylePrefs.push({ icon: Moon, label: "Night Owl" })

            return (
              <Card
                key={listing.id}
                className="hover:shadow-lg transition-all border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full bg-white"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900">{listing.title}</CardTitle>
                  <Badge
                    className={listing.status === "OPEN" ? "bg-emerald-600 text-white" : "bg-slate-400 text-white"}
                  >
                    {listing.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 pt-0">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{listing.location}</span>
                  </div>

                  <div className="flex items-baseline">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-emerald-600">{listing.pricePerMonth}</span>
                    <span className="text-sm text-slate-500 ml-1">/month</span>
                  </div>

                  {lifestylePrefs.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">Lifestyle Preferences</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {lifestylePrefs.map((pref, idx) => {
                          const Icon = pref.icon
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                            >
                              <Icon className="w-4 h-4 text-slate-600" />
                              <span className="text-xs font-medium text-slate-700">{pref.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{listing.description}</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                  <div className="flex gap-3 w-full">
                    <Button variant="outline" asChild className="flex-1 bg-transparent">
                      <Link href={`/listing/${listing.id}`}>View Details</Link>
                    </Button>

                    <Dialog
                      open={openDialogFor === listing.id}
                      onOpenChange={(open) => setOpenDialogFor(open ? listing.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="flex-1">
                          Express Interest
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Interest</DialogTitle>
                        </DialogHeader>
                        <Textarea
                          placeholder="Write a message..."
                          value={interestMessage}
                          onChange={(e) => setInterestMessage(e.target.value)}
                        />
                        <Button
                          className="mt-4 w-full"
                          onClick={() => handleExpressInterest(listing.id)}
                          disabled={isSubmitting}
                        >
                          Send
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
