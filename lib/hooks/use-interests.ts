"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { interestsApi } from "@/lib/api-client"

// Query keys for interests
export const interestKeys = {
  all: ["interests"] as const,
  lists: () => [...interestKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...interestKeys.lists(), filters] as const,
}

// Hook for fetching interests with filters
export function useInterests(filters?: { hostId?: string; status?: string }) {
  return useQuery({
    queryKey: interestKeys.list(filters || {}),
    queryFn: () => interestsApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook for creating an interest
export function useCreateInterest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: interestsApi.create,
    onSuccess: () => {
      // Invalidate interests lists
      queryClient.invalidateQueries({ queryKey: interestKeys.lists() })
    },
  })
}

// Hook for accepting an interest
export function useAcceptInterest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: interestsApi.accept,
    onSuccess: () => {
      // Invalidate interests and matches
      queryClient.invalidateQueries({ queryKey: interestKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ["matches"] })
    },
  })
}

// Hook for rejecting an interest
export function useRejectInterest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => interestsApi.reject(id, reason),
    onSuccess: () => {
      // Invalidate interests lists
      queryClient.invalidateQueries({ queryKey: interestKeys.lists() })
    },
  })
}
