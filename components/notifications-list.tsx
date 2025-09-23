"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Heart, Users, Check, Eye, Trash2 } from "lucide-react"

interface Notification {
  id: string
  type: "INTEREST" | "MATCH"
  payload: any
  isRead: boolean
  createdAt: string
}

// Mock notifications data - removed REVIEW type notifications
const mockNotifications: Notification[] = [
  {
    id: "notif1",
    type: "INTEREST",
    payload: {
      seekerName: "Alex Johnson",
      listingTitle: "Cozy Downtown Apartment",
      listingId: "1",
    },
    isRead: false,
    createdAt: "2024-01-16T10:30:00Z",
  },
  {
    id: "notif2",
    type: "MATCH",
    payload: {
      counterpartyName: "Emma Wilson",
      listingTitle: "Modern Loft Space",
      listingId: "3",
      matchId: "match2",
    },
    isRead: false,
    createdAt: "2024-01-15T14:20:00Z",
  },
  {
    id: "notif3",
    type: "INTEREST",
    payload: {
      seekerName: "Sarah Chen",
      listingTitle: "Cozy Downtown Apartment",
      listingId: "1",
    },
    isRead: true,
    createdAt: "2024-01-14T15:45:00Z",
  },
  {
    id: "notif5",
    type: "MATCH",
    payload: {
      counterpartyName: "Mike Rodriguez",
      listingTitle: "Quiet Suburban Room",
      listingId: "2",
      matchId: "match1",
    },
    isRead: true,
    createdAt: "2024-01-12T11:30:00Z",
  },
]

export function NotificationsList() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)))
    console.log("Marking notification as read:", notificationId)
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
    console.log("Marking all notifications as read")
  }

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
    console.log("Deleting notification:", notificationId)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "INTEREST":
        return <Heart className="h-5 w-5 text-pink-500" />
      case "MATCH":
        return <Users className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case "INTEREST":
        return {
          title: "New Interest Request",
          description: `${notification.payload.seekerName} is interested in "${notification.payload.listingTitle}"`,
          action: (
            <Button variant="outline" size="sm" asChild>
              <Link href="/matching/interests">Review Interest</Link>
            </Button>
          ),
        }
      case "MATCH":
        return {
          title: "New Match!",
          description: `You matched with ${notification.payload.counterpartyName} for "${notification.payload.listingTitle}"`,
          action: (
            <Button variant="outline" size="sm" asChild>
              <Link href="/matching/matches">View Match</Link>
            </Button>
          ),
        }
      default:
        return {
          title: "Notification",
          description: "You have a new notification",
          action: null,
        }
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-space-grotesk mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your roommate matching activity
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">You're all caught up!</h3>
            <p className="text-muted-foreground">No new notifications at the moment.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const content = getNotificationContent(notification)
            return (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${!notification.isRead ? "border-primary/50 bg-primary/5" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">{content.title}</h3>
                            {!notification.isRead && (
                              <Badge variant="destructive" className="h-5 text-xs px-2">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{content.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 ml-4">
                          {content.action}
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Alert className="mt-8">
        <Bell className="h-4 w-4" />
        <AlertDescription>
          Notifications help you stay updated with interest requests and new matches. You can manage your notification
          preferences in your profile settings.
        </AlertDescription>
      </Alert>
    </div>
  )
}
