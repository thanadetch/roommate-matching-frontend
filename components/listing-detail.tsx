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
} from "lucide-react"

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
      <div className="container mx-auto px-4 py-6">
        <Alert>
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
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Link>
        </Button>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Heart className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your interest has been sent to the host! They'll review your message and get back to you soon.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Listing Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-space-grotesk">{listing.title}</CardTitle>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location}
              </div>
            </div>
            <Badge variant={listing.status === "OPEN" ? "default" : "secondary"} className="text-sm">
              {listing.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold text-lg">${listing.pricePerMonth}/month</div>
                <div className="text-sm text-muted-foreground">Monthly rent</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">{new Date(listing.availableFrom).toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">Available from</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">Posted {new Date(listing.createdAt).toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">Listing date</div>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div>
            <h3 className="font-semibold mb-3">House Rules</h3>
            <div className="flex gap-2">
              {listing.rules.noSmoking && (
                <Badge variant="outline">
                  <Cigarette className="w-3 h-3 mr-1" />
                  No Smoking
                </Badge>
              )}
              {listing.rules.noPet && (
                <Badge variant="outline">
                  <Dog className="w-3 h-3 mr-1" />
                  No Pets
                </Badge>
              )}
              {!listing.rules.noSmoking && !listing.rules.noPet && (
                <Badge variant="outline" className="text-muted-foreground">
                  No specific restrictions
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
          </div>

          {/* Host Section */}
          {isHost && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Host Actions
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Heart className="h-4 w-4 mr-1" />
                  {listing.interestCount} people interested
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/host/listings/${listing.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Listing
                    </Link>
                  </Button>
                  {listing.status === "OPEN" && (
                    <Button variant="outline" size="sm" onClick={handleCloseListing}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Close Listing
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Seeker Section */}
          {!isHost && listing.status === "OPEN" && (
            <div className="border-t pt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full md:w-auto">
                    <Heart className="h-4 w-4 mr-2" />
                    Express Interest
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Express Interest in "{listing.title}"</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Send a message to the host about why you'd be a great roommate. Include information about your
                      lifestyle, work schedule, and what you're looking for in a living situation.
                    </p>
                    <Textarea
                      placeholder="Hi! I'm interested in your listing. I'm a clean, responsible person who works in tech. I'm quiet during the week but enjoy socializing on weekends. I'm looking for a comfortable place to call home..."
                      value={interestMessage}
                      onChange={(e) => setInterestMessage(e.target.value)}
                      rows={5}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleExpressInterest} disabled={isLoading} className="flex-1">
                        {isLoading ? "Sending..." : "Send Interest"}
                      </Button>
                      <DialogTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogTrigger>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {!isHost && listing.status === "CLOSED" && (
            <div className="border-t pt-6">
              <Alert>
                <AlertDescription>
                  This listing is currently closed and not accepting new applications.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Listings */}
      <div>
        <h2 className="text-xl font-semibold font-space-grotesk mb-4">Similar Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {relatedListings.map((related) => (
            <Card key={related.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{related.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  {related.location}
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-semibold">${related.pricePerMonth}/month</div>
                  <Button variant="outline" size="sm" asChild>
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
