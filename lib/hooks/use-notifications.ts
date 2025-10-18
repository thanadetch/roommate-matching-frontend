"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationsApi, decodeToken, getToken} from "@/lib/api-client"
import { useState, useEffect } from "react"

// Query keys for notifications
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (userId?: string) => [...notificationKeys.lists(), userId || "current_user"] as const,
}

// Hook for fetching notifications
export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: () => notificationsApi.getAll(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for real-time updates
  })
}

// Hook for marking notification as read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      // Invalidate notifications
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchUnreadCount = async () => {
    try {
      const token = getToken()
      if (!token) {
        setUnreadCount(0)
        setLoading(false)
        return
      }

      const decoded = decodeToken(token) as any
      const userId = decoded?.userId || decoded?.sub || decoded?.id
      if (!userId) {
        setUnreadCount(0)
        setLoading(false)
        return
      }

      // Try to use the dedicated count endpoint first
      try {
        const countData = await notificationsApi.getCount(userId)
        setUnreadCount(countData.count || 0)
      } catch (countError) {
        // Fallback to fetching all notifications and counting unread
        const data = await notificationsApi.getByUserId(userId)
        const unread = (data || []).filter((n: any) => 
          n.status !== "READ" && !n.isRead
        ).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error("Error fetching unread count:", error)
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    
    // Refetch every 30 seconds to keep count updated
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return { unreadCount, loading, refetch: fetchUnreadCount }
}
