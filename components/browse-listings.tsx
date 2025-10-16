// components/browse-listings.tsx
"use client"

import { useMemo, useState } from "react"
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
import { Filter, MapPin, DollarSign, Calendar, Cigarette, Dog, Moon, Volume2, Heart, X } from "lucide-react"

type BrowseFilters = {
  location: string
  priceMin: string
  priceMax: string
  lifestylePreferences: string[] // เก็บไว้ก่อน เผื่อส่งไป backend ภายหลัง
}

export function BrowseListings() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // 1) แยก draft (ค่าที่กำลังพิมพ์) ออกจาก applied (ค่าที่ apply แล้ว)
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

  // dialog state
  const [interestMessage, setInterestMessage] = useState("")
  const [openDialogFor, setOpenDialogFor] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // 2) สร้าง params จาก **appliedFilters** เท่านั้น (ไม่ผูกกับ draft)
  const params = useMemo(() => {
    const p: any = {}
    if (appliedFilters.location) p.location = appliedFilters.location
    if (appliedFilters.priceMin) p.priceMin = Number(appliedFilters.priceMin)
    if (appliedFilters.priceMax) p.priceMax = Number(appliedFilters.priceMax)
    // ถ้าจะส่ง lifestyle ไป backend ค่อย map:
    // if (appliedFilters.lifestylePreferences.includes("noSmoking")) p.noSmoking = true
    // if (appliedFilters.lifestylePreferences.includes("petFriendly")) p.petFriendly = true
    return p
  }, [appliedFilters])

  // 3) useQuery ผูกกับ params จาก applied เท่านั้น → ไม่ refetch ตอนพิมพ์
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["rooms.browse", params],
    queryFn: () => roomsApi.browse(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })

  const listings = Array.isArray(data) ? data : (data?.results ?? [])

  // Helpers
  const toggleLifestylePreference = (preference: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      lifestylePreferences: prev.lifestylePreferences.includes(preference)
        ? prev.lifestylePreferences.filter((p) => p !== preference)
        : [...prev.lifestylePreferences, preference],
    }))
  }

  // 4) Filter panel ใช้ draftFilters อย่างเดียว → ไม่กระทบ useQuery
  const FilterPanel = () => (
    <div className="space-y-6 p-1">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Enter city or neighborhood..."
            value={draftFilters.location}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, location: e.target.value }))}
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
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, priceMin: e.target.value }))}
              className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
            />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="number"
              placeholder="Max"
              value={draftFilters.priceMax}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, priceMax: e.target.value }))}
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
              draftFilters.lifestylePreferences.includes("noSmoking")
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
              draftFilters.lifestylePreferences.includes("petFriendly")
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
              draftFilters.lifestylePreferences.includes("quiet")
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
          onClick={() => {
            // ค่อย apply + refetch ตอนกดปุ่ม
            setAppliedFilters(draftFilters)
            setIsFilterOpen(false)
            refetch()
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 font-medium shadow-sm"
        >
          Apply Filters
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            const reset: BrowseFilters = { location: "", priceMin: "", priceMax: "", lifestylePreferences: [] }
            setDraftFilters(reset)
            setAppliedFilters(reset)
            refetch()
          }}
          className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
        >
          <X className="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
      </div>
    </div>
  )

  const handleExpressInterest = async (listing: any) => {
    try {
      setIsSubmitting(true)
      const token = tokenStorage.get()
      const payload = token ? jwt.decode(token) : null
      const seekerId = payload?.sub || payload?.id

      if (!seekerId) {
        console.error("User not authenticated")
        return
      }

      await roommateMatchingApi.createInterest({
        hostId: listing.hostId,
        seekerId,
        message: interestMessage || undefined,
        roomId: listing.id,
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
                {(appliedFilters.location ||
                  appliedFilters.priceMin ||
                  appliedFilters.priceMax ||
                  appliedFilters.lifestylePreferences.length > 0) && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    {
                      [
                        appliedFilters.location,
                        appliedFilters.priceMin,
                        appliedFilters.priceMax,
                        ...appliedFilters.lifestylePreferences,
                      ].filter(Boolean).length
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

      {/* Render รายการจาก backend ตรง ๆ */}
      {!isLoading && !isError && listings.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <div className="space-y-4">
            <div className="text-6xl">🏠</div>
            <h3 className="text-xl font-semibold text-slate-900">No listings found</h3>
            <p className="text-slate-600">Try adjusting your filters to see more results.</p>
            <Button
              variant="outline"
              onClick={() => {
                const reset: BrowseFilters = { location: "", priceMin: "", priceMax: "", lifestylePreferences: [] }
                setDraftFilters(reset)
                setAppliedFilters(reset)
                refetch()
              }}
              className="border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing: any) => (
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
                  Available {listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString() : "-"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {listing.rules?.noSmoking && (
                    <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
                      <Cigarette className="w-3 h-3 mr-1" />
                      No Smoking
                    </Badge>
                  )}
                  {listing.rules?.noPet && (
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
                  <Dialog
                    open={openDialogFor === listing.id}
                    onOpenChange={(open) => setOpenDialogFor(open ? listing.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                        onClick={() => setOpenDialogFor(listing.id)}
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
                          placeholder="Hi! I'm interested in your listing..."
                          value={interestMessage}
                          onChange={(e) => setInterestMessage(e.target.value)}
                          rows={4}
                          className="border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
                        />
                        <div className="flex gap-2">
                          <Button
                            disabled={isSubmitting}
                            onClick={() => handleExpressInterest(listing)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                          >
                            {isSubmitting ? "Sending..." : "Send Interest"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setInterestMessage("")
                              setOpenDialogFor(null)
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
  )
}
