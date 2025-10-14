"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

// Mock data for interests
const mockInterests = {
  pending: [
    {
      id: "int1",
      listingId: "1",
      listingTitle: "Cozy Downtown Apartment",
      seekerId: "seeker1",
      seekerName: "Alex Johnson",
      seekerProfile: {
        gender: "MALE",
        budgetMin: 1000,
        budgetMax: 1400,
        lifestyle: { smoking: false, pet: false, nightOwl: true, quiet: false },
      },
      message:
        "Hi! I'm a software engineer working remotely. I'm clean, responsible, and looking for a quiet place to focus on work. I'd love to learn more about the room!",
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "int2",
      listingId: "1",
      listingTitle: "Cozy Downtown Apartment",
      seekerId: "seeker2",
      seekerName: "Sarah Chen",
      seekerProfile: {
        gender: "FEMALE",
        budgetMin: 1100,
        budgetMax: 1300,
        lifestyle: { smoking: false, pet: true, nightOwl: false, quiet: true },
      },
      message:
        "Hello! I'm a graduate student at UW. I have a small cat and I'm very respectful of shared spaces. Would love to discuss this opportunity!",
      createdAt: "2024-01-14T15:45:00Z",
    },
    {
      id: "int3",
      listingId: "2",
      listingTitle: "Quiet Suburban Room",
      seekerId: "seeker3",
      seekerName: "Mike Rodriguez",
      seekerProfile: {
        gender: "MALE",
        budgetMin: 700,
        budgetMax: 900,
        lifestyle: { smoking: false, pet: false, nightOwl: false, quiet: true },
      },
      message:
        "I'm interested in your listing. I work early hours and value a quiet environment. I'm clean and responsible.",
      createdAt: "2024-01-13T09:20:00Z",
    },
  ],
  accepted: [
    {
      id: "int4",
      listingId: "3",
      listingTitle: "Modern Loft Space",
      seekerId: "seeker4",
      seekerName: "Emma Wilson",
      seekerProfile: {
        gender: "FEMALE",
        budgetMin: 1400,
        budgetMax: 1600,
        lifestyle: { smoking: false, pet: false, nightOwl: true, quiet: false },
      },
      message: "Love the loft aesthetic! I'm an artist and would appreciate the creative space.",
      createdAt: "2024-01-10T14:20:00Z",
      acceptedAt: "2024-01-11T10:15:00Z",
    },
  ],
  rejected: [
    {
      id: "int5",
      listingId: "1",
      listingTitle: "Cozy Downtown Apartment",
      seekerId: "seeker5",
      seekerName: "Tom Davis",
      seekerProfile: {
        gender: "MALE",
        budgetMin: 800,
        budgetMax: 1000,
        lifestyle: { smoking: true, pet: true, nightOwl: true, quiet: false },
      },
      message: "Hey, looking for a place to crash. I party a lot and have friends over frequently.",
      createdAt: "2024-01-12T20:30:00Z",
      rejectedAt: "2024-01-13T08:00:00Z",
      rejectionReason: "Lifestyle mismatch - looking for quieter roommate",
    },
  ],
}

export function InterestsManagement() {
  const [interests, setInterests] = useState(mockInterests)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null)

  const handleAcceptInterest = (interestId: string) => {
    const interest = interests.pending.find((i) => i.id === interestId)
    if (interest) {
      // Move from pending to accepted
      setInterests((prev) => ({
        ...prev,
        pending: prev.pending.filter((i) => i.id !== interestId),
        accepted: [...prev.accepted, { ...interest, acceptedAt: new Date().toISOString() }],
      }))

      console.log("Accepting interest:", interestId)
      // In real app, this would create a match and send notifications
    }
  }

  const handleRejectInterest = (interestId: string, reason?: string) => {
    const interest = interests.pending.find((i) => i.id === interestId)
    if (interest) {
      // Move from pending to rejected
      setInterests((prev) => ({
        ...prev,
        pending: prev.pending.filter((i) => i.id !== interestId),
        rejected: [
          ...prev.rejected,
          {
            ...interest,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason || "No reason provided",
          },
        ],
      }))

      console.log("Rejecting interest:", interestId, "Reason:", reason)
      setRejectionReason("")
      setSelectedInterest(null)
    }
  }

  const getLifestyleIcons = (lifestyle: any) => {
    const icons = []
    if (!lifestyle.smoking) icons.push({ icon: <Cigarette className="h-3 w-3" />, label: "No Smoking" })
    if (lifestyle.pet) icons.push({ icon: <Dog className="h-3 w-3" />, label: "Pet Friendly" })
    if (lifestyle.quiet) icons.push({ icon: <Volume2 className="h-3 w-3" />, label: "Quiet" })
    if (lifestyle.nightOwl) icons.push({ icon: <Moon className="h-3 w-3" />, label: "Night Owl" })
    return icons
  }

  const InterestCard = ({ interest, showActions = false, status }: any) => (
    <Card key={interest.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/diverse-user-avatars.png" alt={interest.seekerName} />
                <AvatarFallback>
                  {interest.seekerName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-base">{interest.seekerName}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {interest.listingTitle}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center text-emerald-600 font-semibold">
                <DollarSign className="h-4 w-4" />
                {interest.seekerProfile.budgetMin}-{interest.seekerProfile.budgetMax}/mo
              </div>

              <Badge variant="outline" className="text-xs">
                {interest.seekerProfile.gender}
              </Badge>

              <div className="flex items-center gap-1">
                {getLifestyleIcons(interest.seekerProfile.lifestyle).map((item, idx) => (
                  <Badge key={idx} variant="outline" className="p-1">
                    {item.icon}
                  </Badge>
                ))}
              </div>

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
                    <div className="text-xs text-muted-foreground">
                      Sent {new Date(interest.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(interest.createdAt).toLocaleDateString()}
              </div>
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
                        Optionally provide a reason for rejecting this interest. This helps improve the matching
                        process.
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
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Pending ({interests.pending.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Accepted ({interests.accepted.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Rejected ({interests.rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {interests.pending.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending interests</h3>
                <p className="text-muted-foreground">New interest requests will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {interests.pending.map((interest) => (
                <InterestCard key={interest.id} interest={interest} showActions={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted">
          {interests.accepted.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Check className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No accepted interests</h3>
                <p className="text-muted-foreground">Accepted interests will create matches and appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {interests.accepted.map((interest) => (
                <InterestCard key={interest.id} interest={interest} status="accepted" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {interests.rejected.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <X className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No rejected interests</h3>
                <p className="text-muted-foreground">Rejected interests will appear here for your records.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {interests.rejected.map((interest) => (
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
