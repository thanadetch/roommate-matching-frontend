"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Eye, Edit, XCircle, Calendar, DollarSign, MapPin, Home, Users } from "lucide-react"
import { ApiError, jwt, roomsApi, tokenStorage } from "@/lib/api-client"

export function MyListings() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allRooms, setAllRooms] = useState<any[]>([])

  const userId = useMemo(() => {
    const t = tokenStorage.get()
    const payload = t ? jwt.decode(t) : null
    return payload?.sub || null
  }, [])

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        setError(null)
        setLoading(true)
        const rooms = await roomsApi.getAll()
        if (!alive) return
        setAllRooms(Array.isArray(rooms) ? rooms : [])
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to load listings")
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  const listings = useMemo(
    () => allRooms.filter((r) => (userId ? r.hostId === userId : true)),
    [allRooms, userId],
  )

  const handleCloseListing = async (listingId: string) => {
    try {
      await roomsApi.update(listingId, { status: "CLOSED" })
      setAllRooms((prev) => prev.map((r) => (r.id === listingId ? { ...r, status: "CLOSED" } : r)))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to close listing")
    }
  }

  if (loading) {
    return <Card className="p-12 text-center">Loading…</Card>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-balance mb-2">My Listings</h1>
          <p className="text-muted-foreground text-sm">Manage your room listings and track interest</p>
        </div>
        <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm">
          <Link href="/host/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Link>
        </Button>
      </div>

      {error && (
        <Alert className="mb-4">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {listings.length === 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <h2 className="text-lg font-semibold">Your Listings (0)</h2>
          </div>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
            <CardContent className="p-16 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Home className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold">No listings yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Create your first listing to start finding roommates.
                </p>
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl mt-4">
                  <Link href="/host/listings/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Listing
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-3">Your Listings ({listings.length})</h2>

          <div className="space-y-3">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 truncate">{listing.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-2.5">
                        <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        {listing.location}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                        <div className="flex items-center text-emerald-600 font-medium">
                          <DollarSign className="h-4 w-4 mr-0.5" />
                          {listing.pricePerMonth}/mo
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-1.5" />
                          <span className="font-medium text-emerald-600">{listing.interestCount ?? 0}</span>
                          <span className="ml-1">{(listing.interestCount ?? 0) === 1 ? "person" : "people"} interested</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1.5" />
                          {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : "-"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={listing.status === "OPEN" ? "default" : "secondary"}
                        className={listing.status === "OPEN" ? "bg-emerald-500 hover:bg-emerald-600 rounded-lg" : "rounded-lg"}
                      >
                        {listing.status}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" asChild className="h-9 w-9 p-0 rounded-lg hover:bg-emerald-50" title="View listing">
                          <Link href={`/listing/${listing.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="h-9 w-9 p-0 rounded-lg hover:bg-emerald-50" title="Edit listing">
                          <Link href={`/host/listings/${listing.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        {listing.status === "OPEN" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCloseListing(listing.id)}
                            className="h-9 w-9 p-0 rounded-lg hover:bg-red-50 hover:text-red-600"
                            title="Close listing"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
