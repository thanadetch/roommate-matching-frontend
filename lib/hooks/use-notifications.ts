"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationsApi, decodeToken, getToken } from "@/lib/api-client"

// Query keys for notifications
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (userId?: string) => [...notificationKeys.lists(), userId || "current_user"] as const,
  count: (userId?: string) => [...notificationKeys.all, "count", userId || "current_user"] as const,
}

// Hook for fetching notifications by user ID
export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: async () => {
      if (!userId) {
        const token = getToken()
        if (!token) throw new Error("No token found")
        
        const decoded = decodeToken(token) as any
        userId = decoded?.userId || decoded?.sub || decoded?.id
        if (!userId) throw new Error("No user ID found")
      }
      
      return notificationsApi.getByUserId(userId)
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for real-time updates
  })
}

// Hook for getting notification count
export function useNotificationCount(userId?: string) {
  return useQuery({
    queryKey: notificationKeys.count(userId),
    queryFn: async () => {
      let resolvedUserId = userId
      if (!resolvedUserId) {
        const token = getToken()
        if (!token) throw new Error("No token found")
        
        const decoded = decodeToken(token) as any
        resolvedUserId = decoded?.userId || decoded?.sub || decoded?.id
        if (!resolvedUserId) throw new Error("No user ID found")
      }
      
      return notificationsApi.getCount(resolvedUserId)
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Hook for marking notification as read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      // Invalidate notifications and count
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

// Hook for marking all notifications as read
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      return notificationsApi.markAllAsRead(userId)
    },
    onSuccess: () => {
      // Invalidate notifications and count
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

// Hook for deleting notification
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => {
      // Invalidate notifications and count
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
