"use client"

import { useEffect, useState, useCallback } from "react"
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
import { useToast } from "@/lib/hooks/use-toast"

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
  createdAt?: string
}

export function InterestsManagement() {
  const [interests, setInterests] = useState<{ pending: Interest[]; accepted: Interest[]; rejected: Interest[] }>(
    { pending: [], accepted: [], rejected: [] }
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState<"host" | "seeker" | null>(null)
  const { toast } = useToast()

  // ------------------- Load Interests -------------------
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const token = tokenStorage.get()
      const payload = token ? jwt.decode(token) : null
      const id = payload?.sub || payload?.id || payload?.userId
      const role = payload?.role

      setUserId(id)
      setRole(role)

      if (!id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      // Fetch both host and seeker interests
      const [pendingHost, pendingSeeker] = await Promise.all([
        roommateMatchingApi.getInterestsForHost(id, { status: "PENDING" }),
        roommateMatchingApi.getInterestsForSeeker(id, { status: "PENDING" }),
      ])
      const [acceptedHost, acceptedSeeker] = await Promise.all([
        roommateMatchingApi.getInterestsForHost(id, { status: "ACCEPTED" }),
        roommateMatchingApi.getInterestsForSeeker(id, { status: "ACCEPTED" }),
      ])
      const [rejectedHost, rejectedSeeker] = await Promise.all([
        roommateMatchingApi.getInterestsForHost(id, { status: "REJECTED" }),
        roommateMatchingApi.getInterestsForSeeker(id, { status: "REJECTED" }),
      ])

      setInterests({
        pending: [...(pendingHost || []), ...(pendingSeeker || [])],
        accepted: [...(acceptedHost || []), ...(acceptedSeeker || [])],
        rejected: [...(rejectedHost || []), ...(rejectedSeeker || [])],
      })
    } catch (e: any) {
      console.error("[v1] Error loading interests:", e)
      setError(e?.message || "Failed to load interests")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // ------------------- Actions -------------------
  const handleAcceptInterest = async (interestId: string) => {
    try {
      await roommateMatchingApi.acceptInterest(interestId)
      toast({
        title: "Interest Accepted",
        description: "You have successfully accepted this interest.",
      })
      await load()
    } catch (e: any) {
      console.error(e)
      toast({
        title: "Error",
        description: e?.message || "Failed to accept interest",
        variant: "destructive",
      })
    }
  }

  const handleRejectInterest = async (interestId: string) => {
    try {
      await roommateMatchingApi.rejectInterest(interestId)
      toast({
        title: "Interest Rejected",
        description: "You have rejected this interest.",
      })
      await load()
    } catch (e: any) {
      console.error(e)
      toast({
        title: "Error",
        description: e?.message || "Failed to reject interest",
        variant: "destructive",
      })
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
  const InterestCard = ({ interest }: { interest: Interest }) => {
  const isHostView = interest.host?.id === userId
  const userToShow = isHostView ? interest.seeker : interest.host
  const userName = userToShow ? `${userToShow.firstName ?? ""} ${userToShow.lastName ?? ""}`.trim() : "Unnamed User"
  const status = interest.status.toUpperCase()

  // ------------------- Set Card Background Based on Status -------------------
  let cardClass = "mb-4"
  if (status === "REJECTED") cardClass += " bg-red-50"
  else if (status === "ACCEPTED") cardClass += " bg-green-50"
  else if (status === "PENDING") cardClass += " bg-yellow-50"

  return (
    <Card key={interest.id} className={cardClass}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userToShow?.avatar ?? "/diverse-user-avatars.png"} alt={userName} />
                <AvatarFallback>
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
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
                  <Badge key={idx} variant="outline" className="p-1">
                    {item.icon}
                  </Badge>
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
            </div>
          </div>

          {/* Host Actions */}
          {isHostView && status === "PENDING" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white bg-transparent"
                onClick={() => handleAcceptInterest(interest.id)}
              >
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                onClick={() => handleRejectInterest(interest.id)}
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
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
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="pending">
              Pending {interests.pending.length > 0 && `(${interests.pending.length})`}
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted {interests.accepted.length > 0 && `(${interests.accepted.length})`}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected {interests.rejected.length > 0 && `(${interests.rejected.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending">
            {interests.pending.length > 0 ? (
              interests.pending.map((interest) => <InterestCard key={interest.id} interest={interest} />)
            ) : (
              <p className="text-muted-foreground text-center py-8">No pending interests</p>
            )}
          </TabsContent>

          {/* Accepted */}
          <TabsContent value="accepted">
            {interests.accepted.length > 0 ? (
              interests.accepted.map((interest) => <InterestCard key={interest.id} interest={interest} />)
            ) : (
              <p className="text-muted-foreground text-center py-8">No accepted interests</p>
            )}
          </TabsContent>

          {/* Rejected */}
          <TabsContent value="rejected">
            {interests.rejected.length > 0 ? (
              interests.rejected.map((interest) => <InterestCard key={interest.id} interest={interest} />)
            ) : (
              <p className="text-muted-foreground text-center py-8">No rejected interests</p>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}