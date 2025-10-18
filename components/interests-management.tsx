"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, DollarSign, Cigarette, Dog, Moon, Volume2, MessageSquare, MapPin, Calendar } from "lucide-react"
import { roommateMatchingApi, tokenStorage, jwt } from "@/lib/api-client"

interface User {
  id: string
  firstName?: string
  lastName?: string
  avatar?: string
  smoking?: boolean
  petOwner?: boolean
  quietPerson?: boolean
  nightOwl?: boolean
}

interface Room {
  id: string
  title?: string
  location?: string
  pricePerMonth?: number
}

interface Interest {
  id: string
  room?: Room
  seeker?: User
  host?: User
  message?: string | null
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  rejectionReason?: string
  createdAt?: string
}

export function InterestsManagement() {
  const [interests, setInterests] = useState<{ pending: Interest[]; accepted: Interest[]; rejected: Interest[] }>({
    pending: [],
    accepted: [],
    rejected: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // ------------------- Load Interests -------------------
  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = tokenStorage.get()
      const payload = token ? jwt.decode(token) : null
      const id = payload?.sub || payload?.id
      const role = payload?.role
      setUserId(id)
      setIsHost(role === "host")

      if (!id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      let pending: Interest[] = []
      let accepted: Interest[] = []
      let rejected: Interest[] = []

      if (role === "host") {
        ;[pending, accepted, rejected] = await Promise.all([
          roommateMatchingApi.getInterestsForHost(id, { status: "PENDING" }),
          roommateMatchingApi.getInterestsForHost(id, { status: "ACCEPTED" }),
          roommateMatchingApi.getInterestsForHost(id, { status: "REJECTED" }),
        ])
      } else {
        ;[pending, accepted, rejected] = await Promise.all([
          roommateMatchingApi.getInterestsForSeeker(id, { status: "PENDING" }),
          roommateMatchingApi.getInterestsForSeeker(id, { status: "ACCEPTED" }),
          roommateMatchingApi.getInterestsForSeeker(id, { status: "REJECTED" }),
        ])
      }

      setInterests({
        pending: pending || [],
        accepted: accepted || [],
        rejected: rejected || [],
      })
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Failed to load interests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // ------------------- Actions -------------------
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
      await roommateMatchingApi.rejectInterest(interestId)
      setRejectionReason("")
      setSelectedInterest(null)
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  const getLifestyleIcons = (user?: User) => {
    if (!user) return []
    const icons = []
    if (user.smoking === false) icons.push({ icon: <Cigarette className="h-3 w-3" />, label: "No Smoking" })
    if (user.petOwner === false) icons.push({ icon: <Dog className="h-3 w-3" />, label: "No Pets" })
    if (user.quietPerson) icons.push({ icon: <Volume2 className="h-3 w-3" />, label: "Quiet" })
    if (user.nightOwl) icons.push({ icon: <Moon className="h-3 w-3" />, label: "Night Owl" })
    return icons
  }

  // ------------------- InterestCard Component -------------------
  const InterestCard = ({ interest, isHostView = false }: { interest: Interest; isHostView?: boolean }) => {
    const userToShow = isHostView ? interest.seeker : interest.host
    const userName = userToShow ? `${userToShow.firstName ?? ""} ${userToShow.lastName ?? ""}`.trim() : "Unnamed User"

    return (
      <Card key={interest.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userToShow?.avatar ?? "/diverse-user-avatars.png"} alt={userName} />
                  <AvatarFallback>{userName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-base">{userName}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {interest.room?.location ?? "Unknown location"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center text-emerald-600 font-semibold">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {interest.room?.pricePerMonth ? `${interest.room.pricePerMonth}/mo` : "N/A"}
                </div>

                <div className="flex items-center gap-1">
                  {getLifestyleIcons(userToShow).map((item, idx) => (
                    <Badge key={idx} variant="outline" className="p-1">{item.icon}</Badge>
                  ))}
                </div>

                {interest.message && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" /> View Message
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Message from {userName}</DialogTitle>
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

                {/* Show rejection reason if rejected */}
                {interest.status === "REJECTED" && interest.rejectionReason && (
                  <div className="text-sm text-red-600 mt-1">Reason: {interest.rejectionReason}</div>
                )}
              </div>
            </div>

            {/* Host Actions */}
            {isHostView && interest.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                  onClick={() => handleAcceptInterest(interest.id)}
                >
                  <Check className="h-4 w-4 mr-1" /> Accept
                </Button>

                <Dialog open={selectedInterest === interest.id} onOpenChange={(open) => setSelectedInterest(open ? interest.id : null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Interest</DialogTitle>
                    </DialogHeader>
                    <Textarea
                      placeholder="Enter rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mb-3"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setSelectedInterest(null)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectInterest(interest.id, rejectionReason)}
                      >
                        Confirm Reject
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // ------------------- Render -------------------
  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">My Interests</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending">
            {interests.pending.length > 0 ? (
              interests.pending.map((interest) => (
                <InterestCard key={interest.id} interest={interest} isHostView={isHost} />
              ))
            ) : (
              <p className="text-muted-foreground text-center">No pending interests</p>
            )}
          </TabsContent>

          {/* Accepted */}
          <TabsContent value="accepted">
            {interests.accepted.length > 0 ? (
              interests.accepted.map((interest) => (
                <InterestCard key={interest.id} interest={interest} isHostView={isHost} />
              ))
            ) : (
              <p className="text-muted-foreground text-center">No accepted interests</p>
            )}
          </TabsContent>

          {/* Rejected */}
          <TabsContent value="rejected">
            {interests.rejected.length > 0 ? (
              interests.rejected.map((interest) => (
                <InterestCard key={interest.id} interest={interest} isHostView={isHost} />
              ))
            ) : (
              <p className="text-muted-foreground text-center">No rejected interests</p>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
