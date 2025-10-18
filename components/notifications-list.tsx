"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Heart, Users, Check, Eye, Trash2, Loader2, MessageSquare, Star, Clock } from "lucide-react"
import { decodeToken, getToken } from "@/lib/api-client"
import { 
  useNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead, 
  useDeleteNotification 
} from "@/lib/hooks/use-notifications"

type NotificationType =
  | "INTEREST_REQUEST"
  | "MATCH_FOUND"
  | "MESSAGE"
  | "REVIEW"
  | "REMINDER"

type NotificationStatus = "UNREAD" | "READ"

interface Notification {
  id: string
  userId: string
  type: NotificationType
  status: NotificationStatus
  title: string
  message: string
  createdAt: string
  updatedAt: string
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "INTEREST_REQUEST":
      return <Heart className="h-5 w-5 text-pink-500" />
    case "MATCH_FOUND":
      return <Users className="h-5 w-5 text-green-600" />
    case "MESSAGE":
      return <MessageSquare className="h-5 w-5 text-blue-600" />
    case "REVIEW":
      return <Star className="h-5 w-5 text-yellow-500" />
    case "REMINDER":
      return <Clock className="h-5 w-5 text-emerald-600" />
    default:
      return <Bell className="h-5 w-5 text-slate-600" />
  }
}

const getQuickAction = (n: Notification) => {
  switch (n.type) {
    case "INTEREST_REQUEST":
      return (
        <Button variant="outline" size="sm" asChild>
          <Link href="/matching/interests">Review Interest</Link>
        </Button>
      )
    case "MATCH_FOUND":
      return (
        <Button variant="outline" size="sm" asChild>
          <Link href="/matching/matches">View Match</Link>
        </Button>
      )
    default:
      return null
  }
}

export function NotificationsList() {
  // Get user ID from token
  const token = getToken()
  const decoded = token ? decodeToken(token) as any : null
  const userId = decoded?.userId || decoded?.sub || decoded?.id

  // Use hooks for data fetching and mutations
  const { data: notificationsData, isLoading: loading, error } = useNotifications(userId)
  const markAsReadMutation = useMarkNotificationRead()
  const markAllAsReadMutation = useMarkAllNotificationsRead()
  const deleteMutation = useDeleteNotification()

  // Normalize notifications data
  const notifications: Notification[] = (notificationsData || []).map((r: any) => ({
    id: r.id,
    userId: r.userId,
    type: r.type,
    status: r.status ?? (r.isRead ? "READ" : "UNREAD"),
    title: r.title ?? "Notification",
    message:
      r.message ??
      r.payload?.description ??
      "You have a new notification.",
    createdAt: r.createdAt,
    updatedAt: r.updatedAt ?? r.createdAt,
  }))

  const unreadCount = notifications.filter((n) => n.status !== "READ").length

  const handleMarkAllAsRead = () => {
    if (userId) {
      markAllAsReadMutation.mutate(userId)
    }
  }

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
  }

  const handleDeleteNotification = (id: string) => {
    deleteMutation.mutate(id)
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
          <AlertDescription className="text-sm text-red-800">
            {error instanceof Error ? error.message : "Failed to load notifications"}
          </AlertDescription>
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
            disabled={markAllAsReadMutation.isPending}
            className="rounded-xl border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent h-9"
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
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
          {notifications.map((n) => {
            const action = getQuickAction(n)
            const isUnread = n.status !== "READ"

            return (
              <Card
                key={n.id}
                className={`rounded-xl border transition-all hover:shadow-md ${
                  isUnread ? "border-emerald-200 bg-emerald-50/50 shadow-sm" : "border-gray-100 bg-white"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          n.type === "INTEREST_REQUEST" ? "bg-pink-100" : "bg-emerald-100"
                        }`}
                      >
                        {getNotificationIcon(n.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm">{n.title}</h3>
                            {isUnread && (
                              <Badge variant="default" className="h-5 text-xs px-2 bg-emerald-500 hover:bg-emerald-600">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(n.createdAt).toLocaleDateString()} at{" "}
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {action}
                          {isUnread ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(n.id)}
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
                            onClick={() => handleDeleteNotification(n.id)}
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
