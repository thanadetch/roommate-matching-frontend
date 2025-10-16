"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Heart, Users, Check, Eye, Trash2, Loader2 } from "lucide-react"
import { notificationsApi, decodeToken, getToken } from "@/lib/api-client"

interface Notification {
  id: string
  type: "INTEREST" | "MATCH"
  payload: any
  isRead: boolean
  createdAt: string
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

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = getToken()
        if (!token) {
          setError("Please log in to view notifications")
          return
        }

        const decoded = decodeToken(token)
        if (!decoded?.userId) {
          setError("Invalid authentication token")
          return
        }

        const data = await notificationsApi.getByUserId(decoded.userId)
        setNotifications(data)
      } catch (err: any) {
        console.error("[v0] Error fetching notifications:", err)
        setError(err.message || "Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAllAsRead = async () => {
    try {
      const token = getToken()
      if (!token) return

      const decoded = decodeToken(token)
      if (!decoded?.userId) return

      const unreadNotifications = notifications.filter((n) => !n.isRead)
      await Promise.all(unreadNotifications.map((n) => notificationsApi.markAsRead(n.id)))

      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
    } catch (err: any) {
      console.error("[v0] Error marking all as read:", err)
      setError(err.message || "Failed to mark notifications as read")
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch (err: any) {
      console.error("[v0] Error marking notification as read:", err)
      setError(err.message || "Failed to mark notification as read")
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationsApi.delete(id)
      setNotifications(notifications.filter((n) => n.id !== id))
    } catch (err: any) {
      console.error("[v0] Error deleting notification:", err)
      setError(err.message || "Failed to delete notification")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert className="rounded-xl border-red-200 bg-red-50">
          <AlertDescription className="text-sm text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-balance mb-2">Notifications</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-muted-foreground text-sm">Stay updated with your roommate matching activity</p>
            {unreadCount > 0 && (
              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            className="rounded-xl border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent h-9"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
          <CardContent className="p-16 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <Bell className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold">You're all caught up!</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">No new notifications at the moment.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const content = getNotificationContent(notification)
            return (
              <Card
                key={notification.id}
                className={`rounded-xl border transition-all hover:shadow-md ${
                  !notification.isRead ? "border-emerald-200 bg-emerald-50/50 shadow-sm" : "border-gray-100 bg-white"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          notification.type === "INTEREST" ? "bg-pink-100" : "bg-emerald-100"
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm">{content.title}</h3>
                            {!notification.isRead && (
                              <Badge variant="default" className="h-5 text-xs px-2 bg-emerald-500 hover:bg-emerald-600">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{content.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                            {new Date(notification.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {content.action}
                          {!notification.isRead ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-9 w-9 p-0 rounded-lg hover:bg-emerald-100"
                              title="Mark as read"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <div className="h-9 w-9" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="h-9 w-9 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50"
                            title="Delete notification"
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

      <Alert className="mt-8 rounded-xl border-emerald-200 bg-emerald-50/50">
        <Bell className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-sm">
          Notifications help you stay updated with interest requests and new matches. You can manage your notification
          preferences in your profile settings.
        </AlertDescription>
      </Alert>
    </div>
  )
}
