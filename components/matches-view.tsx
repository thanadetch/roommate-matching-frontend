"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Heart, User, MapPin, DollarSign, Calendar, Mail, MessageCircle, Eye, Info, Star, Edit } from "lucide-react"

// Mock data for matches
const mockMatches = {
  asHost: [
    {
      id: "match1",
      listingId: "1",
      listingTitle: "Cozy Downtown Apartment",
      listingLocation: "Downtown Seattle",
      listingPrice: 1200,
      seekerId: "seeker1",
      seekerName: "Alex Johnson",
      seekerContact: {
        line: "@alexj_seattle",
        email: "alex.johnson@email.com",
      },
      matchedAt: "2024-01-16T10:30:00Z",
    },
    {
      id: "match2",
      listingId: "3",
      listingTitle: "Modern Loft Space",
      listingLocation: "Capitol Hill",
      listingPrice: 1500,
      seekerId: "seeker4",
      seekerName: "Emma Wilson",
      seekerContact: {
        line: "@emma.artist",
        email: "emma.wilson@email.com",
      },
      matchedAt: "2024-01-11T10:15:00Z",
    },
  ],
  asSeeker: [
    {
      id: "match3",
      listingId: "4",
      listingTitle: "Studio Near University",
      listingLocation: "University District",
      listingPrice: 900,
      hostId: "host4",
      hostName: "David Kim",
      hostContact: {
        line: "@davidk_uw",
        email: "david.kim@email.com",
      },
      matchedAt: "2024-01-14T14:20:00Z",
    },
  ],
}

const mockReviews = {
  match1: {
    rating: 5,
    comment: "Great roommate, very clean and respectful. Would recommend!",
    createdAt: "2024-01-20T10:00:00Z",
  },
  match3: {
    rating: 4,
    comment: "Good host, apartment was as described. Minor communication issues but overall positive experience.",
    createdAt: "2024-01-18T15:30:00Z",
  },
}

export function MatchesView() {
  const [matches] = useState(mockMatches)
  const [reviews, setReviews] = useState(mockReviews)

  const [dialogStates, setDialogStates] = useState<Record<string, boolean>>({})
  const [formStates, setFormStates] = useState<Record<string, { rating: number; comment: string }>>({})

  const getInitialFormState = useCallback(
    (matchId: string) => {
      const existingReview = reviews[matchId as keyof typeof reviews]
      return existingReview
        ? { rating: existingReview.rating, comment: existingReview.comment }
        : { rating: 5, comment: "" }
    },
    [reviews],
  )

  const openDialog = useCallback(
    (matchId: string) => {
      setDialogStates((prev) => ({ ...prev, [matchId]: true }))
      setFormStates((prev) => ({
        ...prev,
        [matchId]: getInitialFormState(matchId),
      }))
    },
    [getInitialFormState],
  )

  const closeDialog = useCallback((matchId: string) => {
    setDialogStates((prev) => ({ ...prev, [matchId]: false }))
  }, [])

  const updateRating = useCallback((matchId: string, rating: number) => {
    setFormStates((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], rating },
    }))
  }, [])

  const updateComment = useCallback((matchId: string, comment: string) => {
    setFormStates((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], comment },
    }))
  }, [])

  const handleReviewSubmit = useCallback(
    (matchId: string) => {
      const formData = formStates[matchId]
      if (formData) {
        setReviews((prev) => ({
          ...prev,
          [matchId]: {
            ...formData,
            createdAt: new Date().toISOString(),
          },
        }))
      }
      closeDialog(matchId)
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
      [formStates, match.id, getInitialFormState],
    )

    const isDialogOpen = dialogStates[match.id] || false

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-space-grotesk">
                {isHost ? match.listingTitle : match.listingTitle}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {isHost ? match.listingLocation : match.listingLocation}
              </div>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              Matched
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-lg font-semibold">
              <DollarSign className="h-4 w-4 mr-1" />
              {isHost ? match.listingPrice : match.listingPrice}/month
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              Matched {new Date(match.matchedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/diverse-user-avatars.png" alt={counterparty.name} />
                  <AvatarFallback>
                    {counterparty.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{counterparty.name}</div>
                  <div className="text-sm text-muted-foreground">{isHost ? "Your matched roommate" : "Your host"}</div>
                </div>
              </div>
            </div>

            {existingReview && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">My Review:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= existingReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(existingReview.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{existingReview.comment}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Eye className="h-4 w-4 mr-2" />
                    View Contact Info
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contact Information</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Contact information is only visible after a successful match. Please be respectful when reaching
                        out.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Line</div>
                          <div className="text-sm text-muted-foreground">{counterparty.contact.line}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Email</div>
                          <div className="text-sm text-muted-foreground">{counterparty.contact.email}</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Matched on {new Date(match.matchedAt).toLocaleDateString()} at{" "}
                      {new Date(match.matchedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => (open ? openDialog(match.id) : closeDialog(match.id))}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    {existingReview ? <Edit className="h-4 w-4 mr-2" /> : <Star className="h-4 w-4 mr-2" />}
                    {existingReview ? "Edit Review" : "Write Review"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {existingReview ? "Edit Review" : "Write Review"} for {counterparty.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        This review is private and only visible to you. It's for your personal reference about this
                        roommate experience.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => updateRating(match.id, star)} className="p-1">
                            <Star
                              className={`h-6 w-6 ${
                                star <= currentForm.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 hover:text-yellow-200"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`comment-${match.id}`}>Your Experience</Label>
                      <Textarea
                        id={`comment-${match.id}`}
                        placeholder="Share your experience with this roommate/host..."
                        value={currentForm.comment}
                        onChange={(e) => updateComment(match.id, e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => closeDialog(match.id)}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleReviewSubmit(match.id)}>
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
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-space-grotesk mb-2">My Matches</h1>
        <p className="text-muted-foreground">View your successful roommate matches and contact information</p>
      </div>

      <div className="space-y-8">
        {/* As Host Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5" />
            <h2 className="text-xl font-semibold font-space-grotesk">As Host</h2>
            <Badge variant="outline">{matches.asHost.length}</Badge>
          </div>

          {matches.asHost.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <User className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">No matches as host</h3>
                <p className="text-muted-foreground">When you accept interest requests, matches will appear here.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.asHost.map((match) => (
                <MatchCard key={match.id} match={match} type="host" />
              ))}
            </div>
          )}
        </div>

        {/* As Seeker Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5" />
            <h2 className="text-xl font-semibold font-space-grotesk">As Seeker</h2>
            <Badge variant="outline">{matches.asSeeker.length}</Badge>
          </div>

          {matches.asSeeker.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">No matches as seeker</h3>
                <p className="text-muted-foreground">
                  When hosts accept your interest requests, matches will appear here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.asSeeker.map((match) => (
                <MatchCard key={match.id} match={match} type="seeker" />
              ))}
            </div>
          )}
        </div>
      </div>

      <Alert className="mt-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy Notice:</strong> Contact information is only visible after both parties have matched. You can
          write private reviews for your experiences - these are only visible to you and help you keep track of your
          roommate interactions.
        </AlertDescription>
      </Alert>
    </div>
  )
}
