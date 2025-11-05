"use client"

import { useEffect, useState, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Heart, User, MapPin, DollarSign, Calendar, Mail, MessageCircle, Eye, Info, Star, Edit } from "lucide-react"
import { roommateMatchingApi, tokenStorage, jwt, roomsApi, reviewsApi } from "@/lib/api-client"

const getInitialFormState = (matchId: string) => ({ rating: 0, comment: "" })

export function MatchesView() {
  const [matches, setMatches] = useState<{ asHost: any[]; asSeeker: any[] }>({ asHost: [], asSeeker: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roomDetails, setRoomDetails] = useState<Record<string, any>>({})
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string; createdAt: string }>>({})
  const [dialogStates, setDialogStates] = useState<Record<string, boolean>>({})
  const [formStates, setFormStates] = useState<Record<string, { rating: number; comment: string }>>({})
  const [savingReview, setSavingReview] = useState<Record<string, boolean>>({})

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = tokenStorage.get()
      const payload = token ? jwt.decode(token) : null
      const userId = payload?.sub || payload?.id

      if (!userId) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      const res = await roommateMatchingApi.getAllMatches(userId)
      setMatches(res)

      const allMatches = [...(res.asHost || []), ...(res.asSeeker || [])]
      const uniqueListingIds = [...new Set(allMatches.map((m: any) => m.listingId).filter(Boolean))]

      const roomDetailsMap: Record<string, any> = {}
      await Promise.all(
        uniqueListingIds.map(async (listingId: string) => {
          try {
            const room = await roomsApi.getById(listingId)
            roomDetailsMap[listingId] = room
          } catch (e) {
            console.error(`[v0] Failed to fetch room ${listingId}:`, e)
          }
        }),
      )
      setRoomDetails(roomDetailsMap)

      const reviewsRes = await reviewsApi.getAll({ reviewerId: userId })
      const existingReviews = reviewsRes.results || []
      const reviewsMap: Record<string, { rating: number; comment: string; createdAt: string }> = {}
      existingReviews.forEach((review: any) => {
        reviewsMap[review.revieweeId] = {
          rating: review.rating || 0,
          comment: review.comment || "",
          createdAt: review.createdAt || new Date().toISOString()
        }
      })
      setReviews(reviewsMap)
    } catch (e: any) {
      setError(e?.message || "Failed to load matches")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openDialog = useCallback((matchId: string) => {
    setDialogStates((prev) => ({ ...prev, [matchId]: true }))
  }, [])

  const closeDialog = useCallback((matchId: string) => {
    setDialogStates((prev) => ({ ...prev, [matchId]: false }))
  }, [])

  const handleReviewSubmit = useCallback(
    async (matchId: string, localForm: { rating: number; comment: string }, revieweeId: string) => {
      if (localForm.rating === 0) return
      
      setSavingReview((prev) => ({ ...prev, [matchId]: true }))
      
      try {
        // ส่งรีวิวไปยัง API
        const reviewData = await reviewsApi.create({
          revieweeId: revieweeId,
          rating: localForm.rating,
          comment: localForm.comment || undefined
        })

        // อัปเดต state หลังจากบันทึกสำเร็จ
        setReviews((prev) => ({ 
          ...prev, 
          [revieweeId]: { 
            ...localForm, 
            createdAt: reviewData.createdAt || new Date().toISOString() 
          } 
        }))
        setFormStates((prev) => ({ ...prev, [matchId]: localForm }))
        closeDialog(matchId)
      } catch (e: any) {
        console.error("Failed to save review:", e)
        setError(e?.message || "Failed to save review")
      } finally {
        setSavingReview((prev) => ({ ...prev, [matchId]: false }))
      }
    },
    [closeDialog],
  )

  // ----------------------- MatchCard -----------------------
  const MatchCard = memo(
    ({ match, type }: { match: any; type: "host" | "seeker" }) => {
      const isHost = type === "host"
      const counterparty = isHost
        ? { name: `${match.seeker?.firstName || ""} ${match.seeker?.lastName || ""}`, contact: match.seeker }
        : { name: `${match.host?.firstName || ""} ${match.host?.lastName || ""}`, contact: match.host }
  
      const room = match.room
      const canViewContact = match.status === "ACCEPTED"
  
      // ---- review states from outer stores ----
      const revieweeId = isHost ? match.seekerId : match.hostId
      const existingReview = reviews[revieweeId]
      const isDialogOpen = dialogStates[match.id] || false
      const isSaving = !!savingReview[match.id]
  
      // ---- local form (rating/comment) ----
      const [localForm, setLocalForm] = useState<{ rating: number; comment: string }>(
        formStates[match.id] || getInitialFormState(match.id),
      )
      const handleLocalRating = (star: number) =>
        setLocalForm((prev) => ({ ...prev, rating: star }))
      const handleLocalComment = (value: string) =>
        setLocalForm((prev) => ({ ...prev, comment: value }))
  
      return (
        <Card className="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-gray-100 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-base text-balance">{room?.title || "Room"}</CardTitle>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  {room?.location || "Location not specified"}
                </div>
              </div>
  
              <Badge
                variant="default"
                className={`rounded-lg flex-shrink-0 text-xs px-2 py-0.5 ${
                  match.status === "ACCEPTED"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-gray-400 hover:bg-gray-500"
                }`}
              >
                {match.status}
              </Badge>
            </div>
          </CardHeader>
  
          <CardContent className="p-4 space-y-4">
            {/* 💰 Price + Matched date */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center text-base font-semibold text-emerald-600">
                <DollarSign className="h-4 w-4 mr-0.5" />
                {room?.pricePerMonth ? `${room.pricePerMonth} THB/month` : "N/A"}
              </div>
              {match.createdAt && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  Matched {new Date(match.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
  
            {/* 🏠 Room details */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              {room?.availableFrom && (
                <div className="text-xs text-muted-foreground">
                  <strong>Available from:</strong>{" "}
                  {new Date(room.availableFrom).toLocaleDateString()}
                </div>
              )}
              {room?.description && (
                <div className="text-xs text-muted-foreground line-clamp-2">{room.description}</div>
              )}
              <div className="flex gap-1 flex-wrap">
                {room?.noSmoking && <Badge variant="outline" className="text-xs">🚭 No Smoking</Badge>}
                {room?.noPets &&    <Badge variant="outline" className="text-xs">🐾 No Pets</Badge>}
                {room?.quiet &&     <Badge variant="outline" className="text-xs">🤫 Quiet Place</Badge>}
                {room?.nightOwl &&  <Badge variant="outline" className="text-xs">🌙 Night Owl</Badge>}
              </div>
            </div>
  
            {/* 👤 Counterparty */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9 ring-2 ring-emerald-100">
                  <AvatarImage src="/diverse-user-avatars.png" alt={counterparty.name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xs">
                    {counterparty.name?.split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-xs">{counterparty.name || "Unnamed"}</div>
                  <div className="text-xs text-muted-foreground">
                    {isHost ? "Your matched seeker" : "Your matched host"}
                  </div>
                </div>
              </div>
  
              <div className="text-xs text-muted-foreground">
                <strong>Email:</strong> {counterparty.contact?.email || "-"}
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Message:</strong> {match.message || "-"}
              </div>
            </div>
  
            {/* ⭐ Existing review (if any) */}
            {existingReview && (
              <div className="border-t border-gray-100 pt-3">
                <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">My Review:</span>
                      <div className="flex">
                        {[1,2,3,4,5].map(star => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= (existingReview.rating ?? 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(existingReview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {existingReview.comment}
                  </p>
                </div>
              </div>
            )}
  
            {/* 🔘 Actions */}
            <div className="border-t border-gray-100 pt-3 flex gap-2">
              {/* Write/Edit review */}
              <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? openDialog(match.id) : closeDialog(match.id))}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent text-xs h-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {existingReview ? <Edit className="h-3.5 w-3.5 mr-1.5" /> : <Star className="h-3.5 w-3.5 mr-1.5" />}
                    {existingReview ? "Edit Review" : "Write Review"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-balance">
                      {existingReview ? "Edit Review" : "Write Review"} for {counterparty.name}
                    </DialogTitle>
                  </DialogHeader>
  
                  <div className="space-y-4">
                    <Alert className="rounded-xl border-emerald-200 bg-emerald-50/50">
                      <Info className="h-4 w-4 text-emerald-600" />
                      <AlertDescription className="text-sm">
                        This review is private and only visible to you.
                      </AlertDescription>
                    </Alert>
  
                    {/* rating */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Rating</Label>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleLocalRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                            aria-label={`rate ${star}`}
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= (localForm.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 hover:text-yellow-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
  
                    {/* comment */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Your Experience</Label>
                      <Textarea
                        placeholder="Share your experience..."
                        value={localForm.comment || ""}
                        onChange={(e) => handleLocalComment(e.target.value)}
                        rows={4}
                        className="rounded-xl border-gray-200 focus-visible:ring-emerald-500 resize-none"
                      />
                    </div>
  
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => closeDialog(match.id)} className="rounded-xl">
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleReviewSubmit(match.id, localForm, revieweeId)}
                        disabled={isSaving || localForm.rating === 0}
                        className="bg-emerald-500 hover:bg-emerald-600 rounded-xl disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : existingReview ? "Update Review" : "Save Review"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )
    },
    (prev, next) => prev.match.id === next.match.id && prev.type === next.type,
  )



  // ----------------------- Render -----------------------
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance mb-2">My Matches</h1>
        <p className="text-muted-foreground text-sm">View your successful roommate matches and contact information</p>
        {loading && <p className="text-sm text-muted-foreground mt-2">Loading...</p>}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="space-y-8">
        {/* As Host */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold">As Host</h2>
            <Badge variant="outline" className="rounded-lg border-emerald-200 bg-emerald-50 text-emerald-700">{matches.asHost.length}</Badge>
          </div>

          {matches.asHost.length === 0 ? (
            <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
              <CardContent className="p-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold">No matches as host</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">When you accept interest requests, matches will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.asHost.map(m => <MatchCard key={m.id} match={m} type="host" />)}
            </div>
          )}
        </div>

        {/* As Seeker */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
              <Heart className="h-4 w-4 text-pink-600" />
            </div>
            <h2 className="text-xl font-semibold">As Seeker</h2>
            <Badge variant="outline" className="rounded-lg border-pink-200 bg-pink-50 text-pink-700">{matches.asSeeker.length}</Badge>
          </div>

          {matches.asSeeker.length === 0 ? (
            <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-white to-pink-50/30">
              <CardContent className="p-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold">No matches as seeker</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">When hosts accept your interest requests, matches will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.asSeeker.map(m => <MatchCard key={m.id} match={m} type="seeker" />)}
            </div>
          )}
        </div>
      </div>

      <Alert className="mt-8 rounded-xl border-emerald-200 bg-emerald-50/50">
        <Info className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-sm">
          <strong>Privacy Notice:</strong> Contact information is only visible after both parties have matched.
        </AlertDescription>
      </Alert>
    </div>
  )
}