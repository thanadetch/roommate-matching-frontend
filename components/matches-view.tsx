// components/matches-view
"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Heart, User, MapPin, DollarSign, Calendar, Mail, MessageCircle, Eye, Info, Star, Edit } from "lucide-react"
import { matchingApi } from "@/lib/api-client"

const getInitialFormState = (matchId: string) => ({ rating: 0, comment: "" })

export function MatchesView() {
  const [matches, setMatches] = useState<{ asHost: any[]; asSeeker: any[] }>({ asHost: [], asSeeker: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // local-only สำหรับรีวิวส่วนตัว (ยังไม่ผูก backend ส่วนรีวิวในหน้านี้)
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string; createdAt: string }>>({})
  const [dialogStates, setDialogStates] = useState<Record<string, boolean>>({})
  const [formStates, setFormStates] = useState<Record<string, { rating: number; comment: string }>>({})

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await matchingApi.getAllMatches()
      setMatches(res)
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

  const updateRating = useCallback((matchId: string, rating: number) => {
    setFormStates((prev) => ({ ...prev, [matchId]: { ...prev[matchId], rating } }))
  }, [])

  const updateComment = useCallback((matchId: string, comment: string) => {
    setFormStates((prev) => ({ ...prev, [matchId]: { ...prev[matchId], comment } }))
  }, [])

  const handleReviewSubmit = useCallback(
    (matchId: string) => {
      const currentForm = formStates[matchId]
      if (currentForm) {
        setReviews((prev) => ({ ...prev, [matchId]: { ...currentForm, createdAt: new Date().toISOString() } }))
        closeDialog(matchId)
      }
    },
    [formStates, closeDialog],
  )

  const MatchCard = ({ match, type }: { match: any; type: "host" | "seeker" }) => {
    const isHost = type === "host"
    const counterparty = isHost
      ? { name: match.seekerName, contact: match.seekerContact }
      : { name: match.hostName, contact: match.hostContact }

    const existingReview = reviews[match.id as keyof typeof reviews]
    const currentForm = useMemo(
      () => formStates[match.id] || getInitialFormState(match.id),
      [formStates, match.id],
    )
    const isDialogOpen = dialogStates[match.id] || false

    return (
      <Card className="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-base text-balance">
                {match.listingTitle}
              </CardTitle>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                {match.listingLocation}
              </div>
            </div>
            <Badge
              variant="default"
              className="bg-emerald-500 hover:bg-emerald-600 rounded-lg flex-shrink-0 text-xs px-2 py-0.5"
            >
              Matched
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center text-base font-semibold text-emerald-600">
              <DollarSign className="h-4 w-4 mr-0.5" />
              {match.listingPrice}/month
            </div>
            {match.matchedAt && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Matched {new Date(match.matchedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9 ring-2 ring-emerald-100">
                  <AvatarImage src="/diverse-user-avatars.png" alt={counterparty.name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xs">
                    {counterparty.name?.split(" ")?.map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-xs">{counterparty.name}</div>
                  <div className="text-xs text-muted-foreground">{isHost ? "Your matched roommate" : "Your host"}</div>
                </div>
              </div>
            </div>

            {existingReview && (
              <div className="mb-3 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">My Review:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${star <= existingReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(existingReview.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{existingReview.comment}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent text-xs h-8"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View Contact Info
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-balance">Contact Information</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert className="rounded-xl border-emerald-200 bg-emerald-50/50">
                      <Info className="h-4 w-4 text-emerald-600" />
                      <AlertDescription className="text-sm">
                        Contact information is only visible after a successful match.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      {counterparty.contact?.line && (
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Line</div>
                            <div className="text-sm text-muted-foreground">{counterparty.contact.line}</div>
                          </div>
                        </div>
                      )}
                      {counterparty.contact?.email && (
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Mail className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Email</div>
                            <div className="text-sm text-muted-foreground">{counterparty.contact.email}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {match.matchedAt && (
                      <div className="text-xs text-muted-foreground">
                        Matched on {new Date(match.matchedAt).toLocaleDateString()} at{" "}
                        {new Date(match.matchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => (open ? openDialog(match.id) : closeDialog(match.id))}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent text-xs h-8"
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

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Rating</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updateRating(match.id, star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= (currentForm.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 hover:text-yellow-200"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`comment-${match.id}`} className="text-sm font-medium">
                        Your Experience
                      </Label>
                      <Textarea
                        id={`comment-${match.id}`}
                        placeholder="Share your experience..."
                        value={currentForm.comment || ""}
                        onChange={(e) => updateComment(match.id, e.target.value)}
                        rows={4}
                        className="rounded-xl border-gray-200 focus-visible:ring-emerald-500 resize-none"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => closeDialog(match.id)}
                        className="rounded-xl border-gray-200 hover:bg-gray-50 bg-transparent"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleReviewSubmit(match.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                      >
                        {existingReview ? "Update Review" : "Save Review"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance mb-2">My Matches</h1>
        <p className="text-muted-foreground text-sm">View your successful roommate matches and contact information</p>
        {loading && <p className="text-sm text-muted-foreground mt-2">Loading...</p>}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold">As Host</h2>
            <Badge variant="outline" className="rounded-lg border-emerald-200 bg-emerald-50 text-emerald-700">
              {matches?.asHost?.length ?? 0}
            </Badge>
          </div>

          {(matches?.asHost?.length ?? 0) === 0 ? (
            <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold">No matches as host</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    When you accept interest requests, matches will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(matches?.asHost ?? []).map((match) => (
                <MatchCard key={match.id} match={match} type="host" />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
              <Heart className="h-4 w-4 text-pink-600" />
            </div>
            <h2 className="text-xl font-semibold">As Seeker</h2>
            <Badge variant="outline" className="rounded-lg border-pink-200 bg-pink-50 text-pink-700">
              {matches?.asSeeker?.length ?? 0}
            </Badge>
          </div>

          {(matches?.asSeeker?.length ?? 0) === 0 ? (
            <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-white to-pink-50/30">
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold">No matches as seeker</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    When hosts accept your interest requests, matches will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(matches?.asSeeker ?? []).map((match) => (
                <MatchCard key={match.id} match={match} type="seeker" />
              ))}
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
