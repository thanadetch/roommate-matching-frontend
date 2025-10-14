"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  DollarSign,
  Calendar,
  Cigarette,
  Dog,
  Heart,
  Edit,
  XCircle,
  Shield,
  ArrowLeft,
  User,
  CheckCircle2,
} from "lucide-react"

interface ListingDetailProps {
  listingId: string
}

export function ListingDetail({ listingId }: ListingDetailProps) {
  const [interestMessage, setInterestMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Mock current user - in real app this would come from auth context
  const currentUserId = "user1"

  const listing = mockListings.find((l) => l.id === listingId)

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
        <Alert className="rounded-xl border-red-200 bg-red-50">
          <AlertDescription>Listing not found. Please check the URL and try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const isHost = listing.hostId === currentUserId

  const handleExpressInterest = async () => {
    setIsLoading(true)
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Expressing interest in listing:", listingId, "with message:", interestMessage)
    setInterestMessage("")
    setIsLoading(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleCloseListing = () => {
    console.log("Closing listing:", listingId)
    // In real app, this would update the listing status
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl bg-white min-h-screen">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 rounded-lg hover:bg-emerald-50">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Link>
        </Button>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <Alert className="mb-6 rounded-xl border-emerald-200 bg-emerald-50 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 text-sm">
            Your interest has been sent to the host! They'll review your message and get back to you soon.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Listing Card */}
      <Card className="mb-8 rounded-2xl border-0 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-2xl text-balance">{listing.title}</CardTitle>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                {listing.location}
              </div>
            </div>
            <Badge
              variant={listing.status === "OPEN" ? "default" : "secondary"}
              className={`text-sm ${listing.status === "OPEN" ? "bg-emerald-500 hover:bg-emerald-600 rounded-lg" : "rounded-lg"}`}
            >
              {listing.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-lg">${listing.pricePerMonth}/month</div>
                <div className="text-sm text-muted-foreground">Monthly rent</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">{new Date(listing.availableFrom).toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">Available from</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold">{new Date(listing.createdAt).toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">Listing date</div>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">House Rules</h3>
            <div className="flex gap-2 flex-wrap">
              {listing.rules.noSmoking && (
                <Badge variant="outline" className="rounded-lg border-gray-200 bg-white">
                  <Cigarette className="w-3 h-3 mr-1.5" />
                  No Smoking
                </Badge>
              )}
              {listing.rules.noPet && (
                <Badge variant="outline" className="rounded-lg border-gray-200 bg-white">
                  <Dog className="w-3 h-3 mr-1.5" />
                  No Pets
                </Badge>
              )}
              {!listing.rules.noSmoking && !listing.rules.noPet && (
                <Badge variant="outline" className="text-muted-foreground rounded-lg border-gray-200 bg-white">
                  No specific restrictions
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Description</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{listing.description}</p>
          </div>

          {/* Host Section */}
          {isHost && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-semibold mb-4 flex items-center text-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mr-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                </div>
                Host Actions
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Heart className="h-4 w-4 mr-1.5 text-pink-500" />
                  {listing.interestCount} people interested
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-lg border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent"
                  >
                    <Link href={`/host/listings/${listing.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1.5" />
                      Edit Listing
                    </Link>
                  </Button>
                  {listing.status === "OPEN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCloseListing}
                      className="rounded-lg border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 bg-transparent"
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Close Listing
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Seeker Section */}
          {!isHost && listing.status === "OPEN" && (
            <div className="border-t border-gray-100 pt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Express Interest
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-balance">Express Interest in "{listing.title}"</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Send a message to the host about why you'd be a great roommate. Include information about your
                      lifestyle, work schedule, and what you're looking for in a living situation.
                    </p>
                    <Textarea
                      placeholder="Hi! I'm interested in your listing. I'm a clean, responsible person who works in tech. I'm quiet during the week but enjoy socializing on weekends. I'm looking for a comfortable place to call home..."
                      value={interestMessage}
                      onChange={(e) => setInterestMessage(e.target.value)}
                      rows={5}
                      className="rounded-xl border-gray-200 focus-visible:ring-emerald-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleExpressInterest}
                        disabled={isLoading}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                      >
                        {isLoading ? "Sending..." : "Send Interest"}
                      </Button>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="rounded-xl border-gray-200 hover:bg-gray-50 bg-transparent"
                        >
                          Cancel
                        </Button>
                      </DialogTrigger>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {!isHost && listing.status === "CLOSED" && (
            <div className="border-t border-gray-100 pt-6">
              <Alert className="rounded-xl border-gray-200 bg-white">
                <AlertDescription className="text-sm">
                  This listing is currently closed and not accepting new applications.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Listings */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-balance">Similar Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {relatedListings.map((related) => (
            <Card key={related.id} className="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2 text-sm">{related.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  {related.location}
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-emerald-600">${related.pricePerMonth}/month</div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-lg border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent"
                  >
                    <Link href={`/listing/${related.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mock data - in real app this would come from API
const mockListings = [
  {
    id: "1",
    title: "Cozy Downtown Apartment",
    location: "Downtown Seattle",
    pricePerMonth: 1200,
    status: "OPEN" as const,
    rules: { noSmoking: true, noPet: false },
    availableFrom: "2024-02-01",
    description:
      "Beautiful 2BR apartment in the heart of downtown with great city views. The room comes fully furnished with a comfortable bed, desk, and closet space. You'll have access to a shared kitchen, living room, and bathroom. The building has a gym, rooftop terrace, and is walking distance to public transportation.",
    hostId: "host1",
    createdAt: "2024-01-10",
    interestCount: 5,
  },
  {
    id: "2",
    title: "Quiet Suburban Room",
    location: "Bellevue",
    pricePerMonth: 800,
    status: "OPEN" as const,
    rules: { noSmoking: true, noPet: true },
    availableFrom: "2024-01-15",
    description:
      "Peaceful room in a quiet neighborhood, perfect for students or young professionals. The house has a large backyard, modern kitchen, and friendly atmosphere.",
    hostId: "host2",
    createdAt: "2024-01-05",
    interestCount: 3,
  },
  {
    id: "3",
    title: "Modern Loft Space",
    location: "Capitol Hill",
    pricePerMonth: 1500,
    status: "CLOSED" as const,
    rules: { noSmoking: false, noPet: false },
    availableFrom: "2024-03-01",
    description: "Trendy loft in vibrant Capitol Hill area with exposed brick walls and high ceilings.",
    hostId: "host3",
    createdAt: "2024-01-08",
    interestCount: 8,
  },
]

const relatedListings = [
  {
    id: "4",
    title: "Studio Near University",
    location: "University District",
    pricePerMonth: 900,
    status: "OPEN" as const,
  },
  {
    id: "5",
    title: "Shared House in Fremont",
    location: "Fremont",
    pricePerMonth: 1000,
    status: "OPEN" as const,
  },
  {
    id: "6",
    title: "Luxury Condo Room",
    location: "Belltown",
    pricePerMonth: 1800,
    status: "OPEN" as const,
  },
]
