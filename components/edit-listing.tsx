"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin, DollarSign, Calendar, Home, Info } from "lucide-react"
import { ApiError, roomsApi } from "@/lib/api-client"

interface ListingFormData {
  title: string
  location: string
  pricePerMonth: string
  availableFrom: string
  description: string
  status: "OPEN" | "CLOSED"
  noSmoking: boolean
  noPets: boolean
  quiet: boolean
  nightOwl: boolean
}

interface EditListingProps {
  listingId: string
}

export function EditListing({ listingId }: EditListingProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<ListingFormData>>({})
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    location: "",
    pricePerMonth: "",
    availableFrom: "",
    description: "",
    status: "OPEN",
    noSmoking: false,
    noPets: false,
    quiet: false,
    nightOwl: false,
  })

  useEffect(() => {
    let alive = true
    async function fetchListing() {
      try {
        setServerError(null)
        setIsLoadingData(true)
        const data = await roomsApi.getById(listingId)
        if (!alive) return
        setFormData({
          title: data.title ?? "",
          location: data.location ?? "",
          pricePerMonth: data.pricePerMonth != null ? String(data.pricePerMonth) : "",
          availableFrom: data.availableFrom ? data.availableFrom.slice(0, 10) : "",
          description: data.description ?? "",
          status: (data.status as "OPEN" | "CLOSED") ?? "OPEN",
          noSmoking: !!data.noSmoking,
          noPets: !!data.noPets,
          quiet: !!data.quiet,
          nightOwl: !!data.nightOwl,
        })
      } catch (err) {
        setServerError(err instanceof ApiError ? err.message : "Failed to load listing")
      } finally {
        if (alive) setIsLoadingData(false)
      }
    }
    fetchListing()
    return () => {
      alive = false
    }
  }, [listingId])

  const validateForm = (): boolean => {
    const newErrors: Partial<ListingFormData> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    if (!formData.pricePerMonth || Number.parseInt(formData.pricePerMonth) <= 0) {
      newErrors.pricePerMonth = "Price must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setServerError(null)
    const iso = formData.availableFrom
    ? `${formData.availableFrom}T00:00:00.000Z`
    : null;
    try {
      await roomsApi.update(listingId, {
        title: formData.title.trim(),
        location: formData.location.trim(),
        pricePerMonth: Number(formData.pricePerMonth),
        availableFrom: iso,
        description: formData.description || undefined,
        status: formData.status,
        noSmoking: formData.noSmoking,
        noPets: formData.noPets,
        quiet: formData.quiet,
        nightOwl: formData.nightOwl,
      })
      router.push("/host/listings")
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Failed to update listing")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ListingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleStatusChange = (value: "OPEN" | "CLOSED") => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const handleRuleChange = (rule: keyof ListingFormData, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [rule]: checked,
    }))
  }

  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <Skeleton className="h-4 w-32 mb-4 rounded-lg" />
          <Skeleton className="h-8 w-64 mb-2 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <Skeleton className="h-6 w-48 rounded-lg" />
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 rounded-lg hover:bg-emerald-50">
          <Link href="/host/listings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Listings
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-balance mb-2">Edit Listing</h1>
        <p className="text-muted-foreground text-sm">Update your listing details to attract the right roommates.</p>
      </div>

      {serverError && (
        <Alert className="mb-4 rounded-xl border-red-200 bg-red-50">
          <AlertDescription className="text-red-700 text-sm">{serverError}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader className="border-b border-gray-100 p-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Home className="h-4 w-4 text-emerald-600" />
            </div>
            Listing Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Cozy Downtown Apartment"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`rounded-xl h-9 ${errors.title ? "border-red-300 focus-visible:ring-red-500" : "border-gray-200 focus-visible:ring-emerald-500"}`}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-sm font-medium">
                Location <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., Downtown Seattle, Capitol Hill"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className={`pl-10 rounded-xl h-9 ${errors.location ? "border-red-300 focus-visible:ring-red-500" : "border-gray-200 focus-visible:ring-emerald-500"}`}
                />
              </div>
              {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
            </div>

            {/* Price + AvailableFrom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-sm font-medium">
                  Monthly Rent <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    placeholder="1200"
                    value={formData.pricePerMonth}
                    onChange={(e) => handleInputChange("pricePerMonth", e.target.value)}
                    className={`pl-10 rounded-xl h-9 ${errors.pricePerMonth ? "border-red-300 focus-visible:ring-red-500" : "border-gray-200 focus-visible:ring-emerald-500"}`}
                  />
                </div>
                {errors.pricePerMonth && <p className="text-sm text-red-500">{errors.pricePerMonth}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="availableFrom" className="text-sm font-medium">
                  Available From
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="availableFrom"
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => handleInputChange("availableFrom", e.target.value)}
                    className="pl-10 rounded-xl h-9 border-gray-200 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-sm font-medium">
                Listing Status
              </Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="rounded-xl border-gray-200 focus:ring-emerald-500 h-9">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="OPEN" className="rounded-lg">Open - Accepting applications</SelectItem>
                  <SelectItem value="CLOSED" className="rounded-lg">Closed - Not accepting applications</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rules */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">House Rules</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="noSmoking" className="text-sm font-medium cursor-pointer">No Smoking</Label>
                    <p className="text-xs text-muted-foreground">Smoking is not allowed in the property</p>
                  </div>
                  <Switch
                    id="noSmoking"
                    checked={formData.noSmoking}
                    onCheckedChange={(checked) => handleRuleChange("noSmoking", checked)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="noPets" className="text-sm font-medium cursor-pointer">No Pets</Label>
                    <p className="text-xs text-muted-foreground">Pets are not allowed in the property</p>
                  </div>
                  <Switch
                    id="noPets"
                    checked={formData.noPets}
                    onCheckedChange={(checked) => handleRuleChange("noPets", checked)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="quiet" className="text-sm font-medium cursor-pointer">Quiet</Label>
                    <p className="text-xs text-muted-foreground">The property is quiet and peaceful</p>
                  </div>
                  <Switch
                    id="quiet"
                    checked={formData.quiet}
                    onCheckedChange={(checked) => handleRuleChange("quiet", checked)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="nightOwl" className="text-sm font-medium cursor-pointer">Night Owl</Label>
                    <p className="text-xs text-muted-foreground">The property is a night owl and stays up late</p>
                  </div>
                  <Switch
                    id="nightOwl"
                    checked={formData.nightOwl}
                    onCheckedChange={(checked) => handleRuleChange("nightOwl", checked)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your room, the living situation, amenities, and what you're looking for in a roommate..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                className="rounded-xl border-gray-200 focus-visible:ring-emerald-500 resize-none text-sm"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm h-9">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" asChild className="rounded-xl border-gray-200 hover:bg-gray-50 bg-transparent h-9">
                <Link href="/host/listings">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Alert className="mt-6 rounded-xl border-emerald-200 bg-emerald-50/50">
        <Info className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-sm">
          Changes to your listing will be visible to potential roommates immediately after saving.
        </AlertDescription>
      </Alert>
    </div>
  )
}
