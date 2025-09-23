import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.roommatch.com"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
})

apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || `API Error: ${error.response.status} ${error.response.statusText}`
      throw new ApiError(message, error.response.status)
    } else if (error.request) {
      // Request was made but no response received
      throw new ApiError("Network error: No response from server", 0)
    } else {
      // Something else happened
      throw new ApiError(error.message || "Unknown error occurred", 0)
    }
  },
)

async function apiRequest<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
  const response = await apiClient.request<T>({
    url: endpoint,
    ...options,
  })
  return response.data
}

// Listings API functions
export const listingsApi = {
  getAll: (filters?: { location?: string; priceMin?: number; priceMax?: number; status?: string }) =>
    apiRequest<{ listings: any[]; total: number }>(`/listings`, {
      method: "GET",
      params: filters,
    }),

  getById: (id: string) => apiRequest<any>(`/listings/${id}`, { method: "GET" }),

  create: (data: any) =>
    apiRequest<any>("/listings", {
      method: "POST",
      data,
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/listings/${id}`, {
      method: "PATCH",
      data,
    }),

  close: (id: string) =>
    apiRequest<any>(`/listings/${id}/close`, {
      method: "POST",
    }),
}

// Interests API functions
export const interestsApi = {
  getAll: (filters?: { hostId?: string; status?: string }) =>
    apiRequest<{ interests: any[]; total: number }>(`/interests`, {
      method: "GET",
      params: filters,
    }),

  create: (data: { listingId: string; message?: string }) =>
    apiRequest<any>("/interests", {
      method: "POST",
      data,
    }),

  accept: (id: string) =>
    apiRequest<{ interest: any; match: any }>(`/interests/${id}/accept`, {
      method: "POST",
    }),

  reject: (id: string, reason?: string) =>
    apiRequest<any>(`/interests/${id}/reject`, {
      method: "POST",
      data: { reason },
    }),
}

// Matches API functions
export const matchesApi = {
  getAll: (userId?: string) =>
    apiRequest<{ asHost: any[]; asSeeker: any[]; total: number }>(`/matches`, {
      method: "GET",
      params: { userId: userId || "current_user" },
    }),
}

// Profile API functions
export const profileApi = {
  get: () => apiRequest<any>("/profile/me", { method: "GET" }),

  update: (data: any) =>
    apiRequest<any>("/profile/me", {
      method: "PATCH",
      data,
    }),
}

// Notifications API functions
export const notificationsApi = {
  getAll: (userId?: string) =>
    apiRequest<{ notifications: any[]; unreadCount: number }>(`/notifications`, {
      method: "GET",
      params: { userId: userId || "current_user" },
    }),

  markAsRead: (id: string) =>
    apiRequest<any>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),
}

// Reviews API functions
export const reviewsApi = {
  getAll: (userId?: string) =>
    apiRequest<{ received: any[]; given: any[]; averageRating: number }>(`/reviews`, {
      method: "GET",
      params: { userId: userId || "current_user" },
    }),

  create: (data: { matchId: string; rating: number; comment?: string; isAnonymous: boolean }) =>
    apiRequest<any>("/reviews", {
      method: "POST",
      data,
    }),
}

// Error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}
