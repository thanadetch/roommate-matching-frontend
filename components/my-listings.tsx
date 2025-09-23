"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Eye, Edit, XCircle, Calendar, DollarSign, MapPin } from "lucide-react"

// Mock data for current user's listings
const mockUserListings = [
  {
    id: "1",
    title: "Cozy Downtown Apartment",
    location: "Downtown Seattle",
    pricePerMonth: 1200,
    status: "OPEN" as const,
    createdAt: "2024-01-10",
    interestCount: 5,
  },
  {
    id: "2",
    title: "Quiet Suburban Room",
    location: "Bellevue",
    pricePerMonth: 800,
    status: "OPEN" as const,
    createdAt: "2024-01-05",
    interestCount: 3,
  },
  {
    id: "3",
    title: "Modern Loft Space",
    location: "Capitol Hill",
    pricePerMonth: 1500,
    status: "CLOSED" as const,
    createdAt: "2024-01-08",
    interestCount: 8,
  },
]

export function MyListings() {
  const [selectedListings, setSelectedListings] = useState<string[]>([])
  const [listings, setListings] = useState(mockUserListings)

  const handleSelectListing = (listingId: string, checked: boolean) => {
    if (checked) {
      setSelectedListings([...selectedListings, listingId])
    } else {
      setSelectedListings(selectedListings.filter((id) => id !== listingId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedListings(listings.map((listing) => listing.id))
    } else {
      setSelectedListings([])
    }
  }

  const handleCloseListing = (listingId: string) => {
    setListings(
      listings.map((listing) => (listing.id === listingId ? { ...listing, status: "CLOSED" as const } : listing)),
    )
    console.log("Closing listing:", listingId)
  }

  const handleBulkClose = () => {
    const openSelectedListings = selectedListings.filter((id) => {
      const listing = listings.find((l) => l.id === id)
      return listing?.status === "OPEN"
    })

    setListings(
      listings.map((listing) =>
        openSelectedListings.includes(listing.id) ? { ...listing, status: "CLOSED" as const } : listing,
      ),
    )
    setSelectedListings([])
    console.log("Bulk closing listings:", openSelectedListings)
  }

  const canBulkClose = selectedListings.some((id) => {
    const listing = listings.find((l) => l.id === id)
    return listing?.status === "OPEN"
  })

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-space-grotesk mb-2">My Listings</h1>
          <p className="text-muted-foreground">Manage your room listings and track interest</p>
        </div>
        <Button asChild>
          <Link href="/host/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-4xl">🏠</div>
            <h3 className="text-xl font-semibold">No listings yet</h3>
            <p className="text-muted-foreground">Create your first listing to start finding roommates.</p>
            <Button asChild>
              <Link href="/host/listings/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Listings ({listings.length})</CardTitle>
              {selectedListings.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedListings.length} selected</span>
                  <Button variant="outline" size="sm" onClick={handleBulkClose} disabled={!canBulkClose}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Close Selected
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedListings.length === listings.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all listings"
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedListings.includes(listing.id)}
                          onCheckedChange={(checked) => handleSelectListing(listing.id, checked as boolean)}
                          aria-label={`Select ${listing.title}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{listing.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {listing.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={listing.status === "OPEN" ? "default" : "secondary"}>{listing.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {listing.pricePerMonth}/mo
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {listing.interestCount} {listing.interestCount === 1 ? "person" : "people"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/listing/${listing.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/host/listings/${listing.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {listing.status === "OPEN" && (
                            <Button variant="ghost" size="sm" onClick={() => handleCloseListing(listing.id)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {listings.some((listing) => listing.interestCount > 0) && (
        <Alert className="mt-6">
          <AlertDescription>
            You have pending interests on your listings.{" "}
            <Link href="/matching/interests" className="font-medium underline">
              Review them here
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
