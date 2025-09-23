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
import { ArrowLeft, MapPin, DollarSign, Calendar, Home } from "lucide-react"

interface ListingFormData {
  title: string
  location: string
  pricePerMonth: string
  availableFrom: string
  description: string
  status: "OPEN" | "CLOSED"
  rules: {
    noSmoking: boolean
    noPet: boolean
  }
}

// Mock data
const mockListingData = {
  "1": {
    title: "Cozy Downtown Apartment",
    location: "Downtown Seattle",
    pricePerMonth: "1200",
    availableFrom: "2024-02-01",
    description:
      "Beautiful 2BR apartment in the heart of downtown with great city views. The room comes fully furnished with a comfortable bed, desk, and closet space.",
    status: "OPEN" as const,
    rules: { noSmoking: true, noPet: false },
  },
}

interface EditListingProps {
  listingId: string
}

export function EditListing({ listingId }: EditListingProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [errors, setErrors] = useState<Partial<ListingFormData>>({})
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    location: "",
    pricePerMonth: "",
    availableFrom: "",
    description: "",
    status: "OPEN",
    rules: {
      noSmoking: false,
      noPet: false,
    },
  })

  useEffect(() => {
    // Mock API call to fetch listing data
    const fetchListing = async () => {
      setIsLoadingData(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockData = mockListingData[listingId as keyof typeof mockListingData]
      if (mockData) {
        setFormData(mockData)
      }
      setIsLoadingData(false)
    }

    fetchListing()
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

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Updating listing:", listingId, formData)

      // In real app, this would update the listing via API
      router.push("/host/listings")
    } catch (error) {
      console.error("Error updating listing:", error)
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

  const handleRuleChange = (rule: keyof ListingFormData["rules"], checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      rules: { ...prev.rules, [rule]: checked },
    }))
  }

  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/host/listings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Listings
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-space-grotesk mb-2">Edit Listing</h1>
        <p className="text-muted-foreground">Update your listing details to attract the right roommates.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Listing Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Cozy Downtown Apartment"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., Downtown Seattle, Capitol Hill"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className={`pl-10 ${errors.location ? "border-destructive" : ""}`}
                />
              </div>
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            {/* Price and Available From */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Monthly Rent *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    placeholder="1200"
                    value={formData.pricePerMonth}
                    onChange={(e) => handleInputChange("pricePerMonth", e.target.value)}
                    className={`pl-10 ${errors.pricePerMonth ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.pricePerMonth && <p className="text-sm text-destructive">{errors.pricePerMonth}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableFrom">Available From</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="availableFrom"
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => handleInputChange("availableFrom", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Listing Status</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open - Accepting applications</SelectItem>
                  <SelectItem value="CLOSED">Closed - Not accepting applications</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {formData.status === "OPEN"
                  ? "Your listing is visible and accepting new roommate applications."
                  : "Your listing is hidden from search results and not accepting applications."}
              </p>
            </div>

            {/* House Rules */}
            <div className="space-y-4">
              <Label>House Rules</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="noSmoking">No Smoking</Label>
                    <p className="text-sm text-muted-foreground">Smoking is not allowed in the property</p>
                  </div>
                  <Switch
                    id="noSmoking"
                    checked={formData.rules.noSmoking}
                    onCheckedChange={(checked) => handleRuleChange("noSmoking", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="noPet">No Pets</Label>
                    <p className="text-sm text-muted-foreground">Pets are not allowed in the property</p>
                  </div>
                  <Switch
                    id="noPet"
                    checked={formData.rules.noPet}
                    onCheckedChange={(checked) => handleRuleChange("noPet", checked)}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your room, the living situation, amenities, and what you're looking for in a roommate..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={5}
              />
              <p className="text-sm text-muted-foreground">
                Include details about the room, shared spaces, neighborhood, and your ideal roommate.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/host/listings">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Alert className="mt-6">
        <AlertDescription>
          Changes to your listing will be visible to potential roommates immediately after saving.
        </AlertDescription>
      </Alert>
    </div>
  )
}
