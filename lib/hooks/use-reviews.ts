"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { reviewsApi } from "@/lib/api-client"

// Query keys for reviews
export const reviewKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  list: (userId?: string) => [...reviewKeys.lists(), userId || "current_user"] as const,
}

// Hook for fetching reviews
export function useReviews(userId?: string) {
  return useQuery({
    queryKey: reviewKeys.list(userId),
    queryFn: () => reviewsApi.getAll(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for creating a review
export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: () => {
      // Invalidate reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() })
    },
  })
}
