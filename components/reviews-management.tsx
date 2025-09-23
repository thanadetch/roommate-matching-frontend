"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MessageSquare, Shield, Lock, Edit } from "lucide-react"

interface Review {
  id: string
  reviewerId: string
  reviewerName: string
  revieweeId: string
  revieweeName: string
  matchId: string
  matchTitle: string
  rating?: number
  comment?: string
  isAnonymous: boolean
  createdAt: string
}

// Mock reviews data
const mockReviews = {
  given: [
    {
      id: "rev4",
      reviewerId: "user1",
      reviewerName: "John Doe",
      revieweeId: "user2",
      revieweeName: "Emma Wilson",
      matchId: "match2",
      matchTitle: "Modern Loft Space",
      rating: 5,
      comment:
        "Emma was a fantastic host! The space was exactly as described and she was very welcoming. Highly recommend!",
      isAnonymous: false,
      createdAt: "2024-01-16T11:45:00Z",
    },
    {
      id: "rev5",
      reviewerId: "user1",
      reviewerName: "Anonymous",
      revieweeId: "user5",
      revieweeName: "Sarah Chen",
      matchId: "match5",
      matchTitle: "Downtown Apartment",
      rating: 3,
      comment:
        "The living situation was okay but there were some communication issues. The space was clean but not as quiet as expected.",
      isAnonymous: true,
      createdAt: "2024-01-10T16:30:00Z",
    },
  ],
}

// Mock available matches for writing reviews
const availableMatches = [
  {
    id: "match6",
    counterpartyName: "Alex Johnson",
    listingTitle: "Cozy Downtown Apartment",
    matchedAt: "2024-01-18T10:00:00Z",
  },
]

export function ReviewsManagement() {
  const [reviews, setReviews] = useState(mockReviews)
  const [newReview, setNewReview] = useState({
    matchId: "",
    rating: 0,
    comment: "",
  })
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [editReviewData, setEditReviewData] = useState({
    rating: 0,
    comment: "",
  })

  const handleWriteReview = () => {
    if (!selectedMatch || newReview.rating === 0) return

    const review = {
      id: `rev${Date.now()}`,
      reviewerId: "user1",
      reviewerName: "John Doe",
      revieweeId: selectedMatch.counterpartyId,
      revieweeName: selectedMatch.counterpartyName,
      matchId: selectedMatch.id,
      matchTitle: selectedMatch.listingTitle,
      rating: newReview.rating,
      comment: newReview.comment,
      isAnonymous: false,
      createdAt: new Date().toISOString(),
    }

    setReviews((prev) => ({
      ...prev,
      given: [review, ...prev.given],
    }))

    // Reset form
    setNewReview({
      matchId: "",
      rating: 0,
      comment: "",
    })
    setSelectedMatch(null)

    console.log("Writing review:", review)
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setEditReviewData({
      rating: review.rating || 0,
      comment: review.comment || "",
    })
  }

  const handleSaveEditedReview = () => {
    if (!editingReview || editReviewData.rating === 0) return

    setReviews((prev) => ({
      ...prev,
      given: prev.given.map((review) =>
        review.id === editingReview.id
          ? {
              ...review,
              rating: editReviewData.rating,
              comment: editReviewData.comment,
            }
          : review,
      ),
    }))

    // Reset editing state
    setEditingReview(null)
    setEditReviewData({
      rating: 0,
      comment: "",
    })

    console.log("Edited review:", editingReview.id)
  }

  const StarRating = ({ rating, onRatingChange, readonly = false }: any) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange?.(star)}
            className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
            disabled={readonly}
          >
            <Star className={`h-5 w-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
          </button>
        ))}
      </div>
    )
  }

  const ReviewCard = ({ review }: { review: Review }) => {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/diverse-user-avatars.png" alt="You" />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">You</h3>
                  <Badge variant="outline" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">You reviewed {review.revieweeName}</p>
              </div>
            </div>
            <div className="text-right">
              {review.rating && <StarRating rating={review.rating} readonly />}
              <p className="text-xs text-muted-foreground mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Match:</span> {review.matchTitle}
            </div>
            {review.comment && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{review.comment}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => handleEditReview(review)} className="text-xs">
                <Edit className="h-3 w-3 mr-1" />
                Edit Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-space-grotesk mb-2">My Reviews</h1>
        <p className="text-muted-foreground">Your private reviews - only you can see reviews you've written</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Reviews I've Given ({reviews.given.length})</h2>
          </div>

          {availableMatches.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Star className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Write a Private Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Match</Label>
                    <div className="mt-2 space-y-2">
                      {availableMatches.map((match) => (
                        <div
                          key={match.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedMatch?.id === match.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedMatch(match)}
                        >
                          <div className="font-medium text-sm">{match.counterpartyName}</div>
                          <div className="text-xs text-muted-foreground">{match.listingTitle}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedMatch && (
                    <>
                      <div>
                        <Label>Rating</Label>
                        <div className="mt-2">
                          <StarRating
                            rating={newReview.rating}
                            onRatingChange={(rating: number) => setNewReview((prev) => ({ ...prev, rating }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="comment">Comment (Optional)</Label>
                        <Textarea
                          id="comment"
                          placeholder="Share your private thoughts about this roommate experience..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                          rows={4}
                          className="mt-2"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleWriteReview} disabled={newReview.rating === 0} className="flex-1">
                          Submit Private Review
                        </Button>
                        <DialogTrigger asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogTrigger>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="space-y-4">
          {reviews.given.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-xl font-semibold">No reviews given yet</h3>
                <p className="text-muted-foreground">
                  Private reviews you write for your roommates and hosts will appear here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reviews.given.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!editingReview} onOpenChange={(open) => !open && setEditingReview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Private Review</DialogTitle>
          </DialogHeader>
          {editingReview && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium text-sm">{editingReview.revieweeName}</div>
                <div className="text-xs text-muted-foreground">{editingReview.matchTitle}</div>
              </div>

              <div>
                <Label>Rating</Label>
                <div className="mt-2">
                  <StarRating
                    rating={editReviewData.rating}
                    onRatingChange={(rating: number) => setEditReviewData((prev) => ({ ...prev, rating }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-comment">Comment (Optional)</Label>
                <Textarea
                  id="edit-comment"
                  placeholder="Share your private thoughts about this roommate experience..."
                  value={editReviewData.comment}
                  onChange={(e) => setEditReviewData((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveEditedReview} disabled={editReviewData.rating === 0} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingReview(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Alert className="mt-8">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Private Reviews:</strong> All reviews are completely private and only visible to you. You cannot see
          reviews others have written about you. Use this space to keep personal notes about your roommate experiences
          for future reference.
        </AlertDescription>
      </Alert>
    </div>
  )
}
