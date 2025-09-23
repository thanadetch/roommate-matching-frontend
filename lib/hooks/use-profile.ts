"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { profileApi } from "@/lib/api-client"

// Query keys for profile
export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "me"] as const,
}

// Hook for fetching user profile
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: profileApi.get,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for updating user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: profileApi.update,
    onSuccess: () => {
      // Invalidate profile data
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })
}
