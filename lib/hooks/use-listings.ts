"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listingsApi } from "@/lib/api-client"

// Query keys for consistent cache management
export const listingKeys = {
  all: ["listings"] as const,
  lists: () => [...listingKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...listingKeys.lists(), filters] as const,
  details: () => [...listingKeys.all, "detail"] as const,
  detail: (id: string) => [...listingKeys.details(), id] as const,
}

// Hook for fetching all listings with filters
export function useListings(filters?: { location?: string; priceMin?: number; priceMax?: number; status?: string }) {
  return useQuery({
    queryKey: listingKeys.list(filters || {}),
    queryFn: () => listingsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for fetching a single listing
export function useListing(id: string) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => listingsApi.getById(id),
    enabled: !!id,
  })
}

// Hook for creating a new listing
export function useCreateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: listingsApi.create,
    onSuccess: () => {
      // Invalidate and refetch listings
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() })
    },
  })
}

// Hook for updating a listing
export function useUpdateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => listingsApi.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific listing and lists
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() })
    },
  })
}

// Hook for closing a listing
export function useCloseListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: listingsApi.close,
    onSuccess: (_, id) => {
      // Invalidate specific listing and lists
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() })
    },
  })
}
