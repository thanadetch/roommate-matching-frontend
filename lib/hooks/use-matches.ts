"use client"

import { useQuery } from "@tanstack/react-query"
import { matchesApi } from "@/lib/api-client"

// Query keys for matches
export const matchKeys = {
  all: ["matches"] as const,
  lists: () => [...matchKeys.all, "list"] as const,
  list: (userId?: string) => [...matchKeys.lists(), userId || "current_user"] as const,
}

// Hook for fetching user matches
export function useMatches(userId?: string) {
  return useQuery({
    queryKey: matchKeys.list(userId),
    queryFn: () => matchesApi.getAll(userId),
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}
