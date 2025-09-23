"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationsApi } from "@/lib/api-client"

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
    queryFn: () => notificationsApi.getAll(userId),
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
