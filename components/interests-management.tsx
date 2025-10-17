"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { interestsApi } from "@/lib/api-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Heart,
  Check,
  X,
  DollarSign,
  Cigarette,
  Dog,
  Moon,
  Volume2,
  MessageSquare,
  MapPin,
  Calendar,
} from "lucide-react"
import { roommateMatchingApi, tokenStorage, jwt } from "@/lib/api-client"

export function InterestsManagement() {
  const [interests, setInterests] = useState<{ pending: any[]; accepted: any[]; rejected: any[] }>({
    pending: [],
    accepted: [],
    rejected: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = tokenStorage.get()
      const payload = token ? jwt.decode(token) : null
      const hostId = payload?.sub || payload?.id

      if (!hostId) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      const [pending, accepted, rejected] = await Promise.all([
        roommateMatchingApi.getInterestsForHost(hostId, { status: "PENDING" }),
        roommateMatchingApi.getInterestsForHost(hostId, { status: "ACCEPTED" }),
        roommateMatchingApi.getInterestsForHost(hostId, { status: "REJECTED" }),
      ])

      setInterests({
        pending: pending || [],
        accepted: accepted || [],
        rejected: rejected || [],
      })
    } catch (e: any) {
      setError(e?.message || "Failed to load interests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAcceptInterest = async (interestId: string) => {
    try {
      await roommateMatchingApi.acceptInterest(interestId)
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  const handleRejectInterest = async (interestId: string, reason?: string) => {
  try {
    await interestsApi.reject(interestId, reason)
    setRejectionReason("")
    setSelectedInterest(null)
    await load()
  } catch (e) {
    console.error(e)
  }
}

  const getLifestyleIcons = (lifestyle: any) => {
    const icons = []
    if (lifestyle && lifestyle.smoking === false) icons.push({ icon: <Cigarette className="h-3 w-3" />, label: "No Smoking" })
    if (lifestyle && lifestyle.pet === false) icons.push({ icon: <Dog className="h-3 w-3" />, label: "No Pets" })
    if (lifestyle && lifestyle.quiet) icons.push({ icon: <Volume2 className="h-3 w-3" />, label: "Quiet" })
    if (lifestyle && lifestyle.nightOwl) icons.push({ icon: <Moon className="h-3 w-3" />, label: "Night Owl" })
    return icons
  }

  const InterestCard = ({ interest, showActions = false, status }: any) => (
    <Card key={interest.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={interest.seekerAvatar ?? "/diverse-user-avatars.png"} alt={interest.seekerName} />
                <AvatarFallback>
                  {interest.seekerName
                    ?.split(" ")
                    ?.map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-base">{interest.seekerName}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {interest.listingLocation ?? interest.listing?.location ?? "Unknown location"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm flex-wrap">
              {interest.seekerProfile && (
                <>
                  <div className="flex items-center text-emerald-600 font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {interest.seekerProfile.budgetMin}-{interest.seekerProfile.budgetMax}/mo
                  </div>

                  {interest.seekerProfile.gender && (
                    <Badge variant="outline" className="text-xs">
                      {interest.seekerProfile.gender}
                    </Badge>
                  )}

                  <div className="flex items-center gap-1">
                    {getLifestyleIcons(interest.seekerProfile.lifestyle || {}).map((item, idx) => (
                      <Badge key={idx} variant="outline" className="p-1">
                        {item.icon}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {interest.message && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      View Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Message from {interest.seekerName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">{interest.message}</p>
                      </div>
                      {interest.createdAt && (
                        <div className="text-xs text-muted-foreground">
                          Sent {new Date(interest.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {interest.createdAt && (
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(interest.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {showActions ? (
              <>
                <Button size="sm" onClick={() => handleAcceptInterest(interest.id)} className="h-9">
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInterest(interest.id)}
                      className="h-9"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Interest</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Optionally provide a reason for rejecting this interest.
                      </p>
                      <Textarea
                        placeholder="e.g., Looking for someone with different lifestyle preferences..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRejectInterest(interest.id, rejectionReason)}
                          variant="outline"
                          className="flex-1"
                        >
                          Reject Interest
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedInterest(null)
                            setRejectionReason("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Badge variant={status === "accepted" ? "default" : "secondary"} className="h-9 px-4">
                {status === "accepted" ? "Accepted" : "Rejected"}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-space-grotesk mb-2">Interest Management</h1>
        <p className="text-muted-foreground">Review and manage interest requests for your listings</p>
        {loading && <p className="text-sm text-muted-foreground mt-2">Loading...</p>}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Pending ({interests?.pending?.length ?? 0})
          </TabsTrigger>

          <TabsTrigger value="accepted" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Accepted ({interests?.accepted?.length ?? 0})
          </TabsTrigger>

          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Rejected ({interests?.rejected?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {(interests?.pending?.length ?? 0) === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending interests</h3>
                <p className="text-muted-foreground">New interest requests will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {(interests?.pending ?? []).map((interest) => (
                <InterestCard key={interest.id} interest={interest} showActions={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted">
          {(interests?.accepted?.length ?? 0) === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Check className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No accepted interests</h3>
                <p className="text-muted-foreground">Accepted interests will create matches and appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {(interests?.accepted ?? []).map((interest) => (
                <InterestCard key={interest.id} interest={interest} status="accepted" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {(interests?.rejected?.length ?? 0) === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <X className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No rejected interests</h3>
                <p className="text-muted-foreground">Rejected interests will appear here for your records.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {(interests?.rejected ?? []).map((interest) => (
                <InterestCard key={interest.id} interest={interest} status="rejected" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Alert className="mt-6">
        <AlertDescription>
          When you accept an interest, a match is automatically created and both parties can view each other's contact
          information.
        </AlertDescription>
      </Alert>
    </div>
  )
}
