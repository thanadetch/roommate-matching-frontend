"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MessageSquare, Shield, Lock, Edit, Trash } from "lucide-react"
import { ApiError, jwt, reviewsApi, tokenStorage, roommateMatchingApi } from "@/lib/api-client"

interface Review {
  id: string
  reviewerId: string
  revieweeId: string
  rating?: number
  comment?: string
  createdAt: string
  revieweeProfile?: {
    firstName?: string
    lastName?: string
  }
}

export function ReviewsManagement() {
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewedSet, setReviewedSet] = useState<Set<string>>(new Set())

  // form: create
  const [openCreate, setOpenCreate] = useState(false)
  const [createForm, setCreateForm] = useState<{ revieweeId: string; rating: number; comment: string }>({
    revieweeId: "",
    rating: 0,
    comment: "",
  })

  // form: edit
  const [editing, setEditing] = useState<Review | null>(null)
  const [editForm, setEditForm] = useState<{ rating: number; comment: string }>({ rating: 0, comment: "" })

  // match options
  const [matchOptions, setMatchOptions] = useState<{ userId: string; name: string }[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let alive = true
    async function bootstrap() {
      try {
        const t = tokenStorage.get()
        const payload = t ? jwt.decode(t) : null
        const sub = payload?.sub || null
        if (alive) setUserId(sub)

        if (!sub) {
          if (alive) {
            setLoading(false)
            setError("Not authenticated")
          }
          return
        }

        // โหลดรีวิวของเรา
        const res = await reviewsApi.getAll({ reviewerId: sub })
        const myReviews = res.results || []
        if (alive) {
          setReviews(myReviews)
          setReviewedSet(new Set(myReviews.map((r) => r.revieweeId)))
        }

        // โหลด matches เอามาสร้างรายชื่อ counterparties
        const matches = await roommateMatchingApi.getAllMatches(sub)
        const asHost = (matches?.asHost ?? []).map((m: any) => ({ userId: m.seekerId, name: m.seekerName }))
        const asSeeker = (matches?.asSeeker ?? []).map((m: any) => ({ userId: m.hostId, name: m.hostName }))
        const all = [...asHost, ...asSeeker]

        // unique by userId
        const uniqMap = new Map<string, { userId: string; name: string }>()
        for (const u of all) if (!uniqMap.has(u.userId)) uniqMap.set(u.userId, u)
        if (alive) setMatchOptions(Array.from(uniqMap.values()))
      } catch (e) {
        if (alive) setError(e instanceof ApiError ? e.message : "Failed to load reviews")
      } finally {
        if (alive) setLoading(false)
      }
    }
    bootstrap()
    return () => {
      alive = false
    }
  }, [])

  const StarRating = ({ rating, onRatingChange, readonly = false }: any) => (
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

  const fullNameOf = (r: Review) => {
    const fn = r.revieweeProfile?.firstName || ""
    const ln = r.revieweeProfile?.lastName || ""
    const name = `${fn} ${ln}`.trim()
    return name || r.revieweeId
  }

  async function handleCreate() {
    if (!createForm.revieweeId || createForm.rating === 0) return
    setSaving(true)
    setError(null)
    try {
      // backend มี upsert logic: ถ้าเคยรีวิวแล้วจะ update ให้เอง
      const createdOrUpdated = await reviewsApi.create({
        revieweeId: createForm.revieweeId,
        rating: createForm.rating,
        comment: createForm.comment || undefined,
      })

      setReviews((prev) => {
        const idx = prev.findIndex((x) => x.revieweeId === createdOrUpdated.revieweeId)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = createdOrUpdated
          return next
        }
        return [createdOrUpdated, ...prev]
      })
      setReviewedSet((s) => new Set([...Array.from(s), createdOrUpdated.revieweeId]))

      setCreateForm({ revieweeId: "", rating: 0, comment: "" })
      setOpenCreate(false)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to create review")
    } finally {
      setSaving(false)
    }
  }

  function onEditClick(r: Review) {
    setEditing(r)
    setEditForm({ rating: r.rating || 0, comment: r.comment || "" })
  }

  async function handleSaveEdit() {
    if (!editing) return
    if (editForm.rating === 0) return
    setSaving(true)
    setError(null)
    try {
      const updated = await reviewsApi.update(editing.id, {
        rating: editForm.rating,
        comment: editForm.comment || undefined,
      })
      setReviews((prev) => prev.map((x) => (x.id === editing.id ? updated : x)))
      setEditing(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update review")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setSaving(true)
    setError(null)
    try {
      await reviewsApi.delete(id)
      setReviews((prev) => prev.filter((x) => x.id !== id))
      // sync reviewedSet ด้วย (ลบออกเพื่อให้กลับไปเลือกใน create ได้)
      const after = reviews.filter((x) => x.id !== id)
      setReviewedSet(new Set(after.map((r) => r.revieweeId)))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete review")
    } finally {
      setSaving(false)
    }
  }

  const ReviewCard = ({ review }: { review: Review }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/diverse-user-avatars.png" alt="You" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">You</h3>
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">You reviewed {fullNameOf(review)}</p>
            </div>
          </div>
          <div className="text-right">
            {review.rating && <StarRating rating={review.rating} readonly />}
            <p className="text-xs text-muted-foreground mt-1">
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {review.comment && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{review.comment}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onEditClick(review)} className="text-xs">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDelete(review.id)} className="text-xs">
              <Trash className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!mounted) return null

  const selectableOptions = matchOptions.filter((opt) => !reviewedSet.has(opt.userId))

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-space-grotesk mb-2">My Reviews</h1>
        <p className="text-muted-foreground">Your private reviews - only you can see reviews you've written</p>
      </div>

      {error && (
        <Alert className="mb-4 border-destructive/40 bg-destructive/10">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Reviews I've Given ({reviews.length})</h2>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button disabled={selectableOptions.length === 0}>
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
                <Label htmlFor="reviewee">Choose a matched user</Label>
                <select
                  id="reviewee"
                  className="mt-2 w-full border rounded-md h-10 px-3"
                  value={createForm.revieweeId}
                  onChange={(e) => setCreateForm((p) => ({ ...p, revieweeId: e.target.value }))}
                >
                  <option value="">-- Select --</option>
                  {selectableOptions.map((opt) => (
                    <option key={opt.userId} value={opt.userId}>
                      {opt.name && opt.name.trim().length > 0 ? opt.name : "Unknown user"}
                    </option>
                  ))}
                </select>
                {selectableOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    You have reviewed all matched users. Use “Edit” below to update an existing review.
                  </p>
                )}
              </div>

              <div>
                <Label>Rating</Label>
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCreateForm((p) => ({ ...p, rating: star }))}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= (createForm.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your private thoughts about this roommate experience..."
                  value={createForm.comment}
                  onChange={(e) => setCreateForm((p) => ({ ...p, comment: e.target.value }))}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={!createForm.revieweeId || createForm.rating === 0 || saving} className="flex-1">
                  {saving ? "Submitting..." : "Submit Review"}
                </Button>
                <Button variant="outline" onClick={() => setOpenCreate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card className="p-12 text-center">Loading…</Card>
      ) : reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">No reviews given yet</h3>
            <p className="text-muted-foreground">Private reviews you write for your roommates will appear here.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Private Review</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-sm">
                Review for: <span className="font-medium">{fullNameOf(editing)}</span>
              </div>

              <div>
                <Label>Rating</Label>
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditForm((p) => ({ ...p, rating: star }))}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= (editForm.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-comment">Comment (Optional)</Label>
                <Textarea
                  id="edit-comment"
                  placeholder="Update your private thoughts..."
                  value={editForm.comment}
                  onChange={(e) => setEditForm((p) => ({ ...p, comment: e.target.value }))}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={editForm.rating === 0 || saving} className="flex-1">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(null)}>
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
          <strong>Private Reviews:</strong> Only you can see the reviews you write. Write once per user; re-open a review to update it.
        </AlertDescription>
      </Alert>
    </div>
  )
}
