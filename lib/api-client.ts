import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.roommatch.com"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, 
})

export const tokenStorage = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null),
  set: (t: string) => localStorage.setItem("auth_token", t),
  clear: () => localStorage.removeItem("auth_token"),
}

export const jwtUtil = {
  decode: (token: string) => {
    try {
      const parts = token.split(".")
      if (parts.length < 2) return null
      const payload = parts[1]

      // handle base64url (replace -/_ และเติม padding)
      const b64 = payload.replace(/-/g, "+").replace(/_/g, "/")
      const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4))

      const json =
        typeof window !== "undefined"
          ? atob(b64 + pad)
          : Buffer.from(b64 + pad, "base64").toString()

      return JSON.parse(json)
    } catch {
      return null
    }
  },
}

export const jwt = jwtUtil

export const getToken = tokenStorage.get
export const decodeToken = jwtUtil.decode

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = tokenStorage.get()
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
      const message = error.response.data?.message || `API Error: ${error.response.status} ${error.response.statusText}`
      throw new ApiError(message, error.response.status)
    } else if (error.request) {
      throw new ApiError("Network error: No response from server", 0)
    } else {
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

export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiRequest<{
      access_token: string
    }>("/auth/login", {
      method: "POST",
      data,
    }),
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    apiRequest<{
      id: string
      email: string
      firstName: string
      lastName: string
    }>("/auth/register", {
      method: "POST",
      data,
    }),
}

export const roomsApi = {
  create: (data: {
    title: string
    location: string
    pricePerMonth: number
    availableFrom?: string | null
    description?: string
    noSmoking?: boolean
    noPets?: boolean
    quiet?: boolean
    nightOwl?: boolean
    hostId?: string
  }) =>
    apiRequest<any>("/rooms", {
      method: "POST",
      data,
    }),

  getAll: () =>
    apiRequest<any[]>("/rooms", {
      method: "GET",
    }),

  browse: async (filters?: { location?: string; priceMin?: number; priceMax?: number; status?: string }) => {
    const raw = await apiRequest<any>("/rooms/browse", { method: "GET", params: filters })

    const list = Array.isArray(raw) ? raw : (raw?.results ?? raw?.data ?? raw?.rooms ?? [])

    const normalized = list.map((r: any) => ({
      id: r.id,
      title: r.title,
      location: r.location,
      pricePerMonth: r.pricePerMonth ?? r.price_per_month ?? r.price ?? 0,
      status: r.status ?? "OPEN",
      description: r.description ?? "",
      availableFrom: r.availableFrom ?? r.available_from ?? r.availableDate ?? null,
      noSmoking: r.noSmoking ?? false,
      noPets: r.noPets ?? false,
      quiet: r.quiet ?? false,
      nightOwl: r.nightOwl ?? false,
      hostId: r.hostId ?? r.host_id ?? r.ownerId ?? undefined,
      createdAt: r.createdAt ?? r.created_at ?? undefined,
    }))

    return normalized
  },

  getById: (id: string) => apiRequest<any>(`/rooms/${id}`, { method: "GET" }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/rooms/${id}`, {
      method: "PUT",
      data,
    }),

  remove: (id: string) =>
    apiRequest<any>(`/rooms/${id}`, {
      method: "DELETE",
    }),
}

export const roommateMatchingApi = {
  createInterest: (data: { hostId: string; seekerId: string; message?: string , roomId: string}) =>
    apiRequest<any>("/roommate-matching/interests", {
      method: "POST",
      data,
    }),

  getInterestById: (id: string) => apiRequest<any>(`/roommate-matching/interests/${id}`, { method: "GET" }),

  updateInterestStatus: (id: string, data: { status: string; reason?: string }) =>
    apiRequest<any>(`/roommate-matching/interests/${id}/status`, {
      method: "PUT",
      data,
    }),

  acceptInterest: (id: string) => apiRequest<any>(`/roommate-matching/interests/${id}/accept`, { method: "PUT" }),

  rejectInterest: (id: string) => apiRequest<any>(`/roommate-matching/interests/${id}/reject`, { method: "PUT" }),

  getInterestsForHost: (hostId: string, filters?: { status?: string }) =>
    apiRequest<any[]>(`/roommate-matching/interests/host/${hostId}`, {
      method: "GET",
      params: filters,
    }),

  getInterestsForSeeker: (seekerId: string, filters?: { status?: string }) =>
    apiRequest<any[]>(`/roommate-matching/interests/seeker/${seekerId}`, {
      method: "GET",
      params: filters,
    }),

  getInterestCounts: (hostId: string) =>
    apiRequest<{ pending: number; accepted: number; rejected: number }>(
      `/roommate-matching/interests/host/${hostId}/counts`,
      {
        method: "GET",
      },
    ),

  getMatchesAsHost: (hostId: string) =>
    apiRequest<any[]>(`/roommate-matching/matches/host/${hostId}`, { method: "GET" }),

  getMatchesAsSeeker: (seekerId: string) =>
    apiRequest<any[]>(`/roommate-matching/matches/seeker/${seekerId}`, { method: "GET" }),

  getAllMatches: (userId: string) =>
    apiRequest<{ asHost: any[]; asSeeker: any[] }>(`/roommate-matching/matches/user/${userId}`, {
      method: "GET",
    }),
}

export const profileApi = {
  getByEmail: (email: string) =>
    apiRequest<{ result?: any }>(`/profiles/email/${encodeURIComponent(email)}`, { method: "GET" }),

  getById: (id: string) => apiRequest<{ result?: any }>(`/profiles/${id}`, { method: "GET" }),

  updateById: (id: string, data: any) =>
    apiRequest<any>(`/profiles/${id}`, {
      method: "PUT",
      data,
    }),

  create: (data: any) =>
    apiRequest<any>(`/profiles`, {
      method: "POST",
      data,
    }),

  delete: (id: string) =>
    apiRequest<any>(`/profiles/${id}`, {
      method: "DELETE",
    }),
}

export const reviewsApi = {
  create: (data: { revieweeId: string; rating: number; comment?: string }) =>
    apiRequest<any>(`/reviews`, {
      method: "POST",
      data,
    }),

    getAll: (filters?: { reviewerId?: string; revieweeId?: string }) =>
      apiRequest<{ results: any[] }>(`/reviews`, {
        method: "GET",
        params: filters,
      }),

  getByUser: (userId: string) =>
    apiRequest<{ results: any[] }>(`/reviews/by-user/${userId}`, {
      method: "GET",
    }),

  getForUser: (userId: string) =>
    apiRequest<{ results: any[] }>(`/reviews/for-user/${userId}`, {
      method: "GET",
    }),

  getById: (id: string) =>
    apiRequest<any>(`/reviews/${id}`, {
      method: "GET",
    }),

  update: (id: string, data: { rating?: number; comment?: string }) =>
    apiRequest<any>(`/reviews/${id}`, {
      method: "PUT",
      data,
    }),

  delete: (id: string) =>
    apiRequest<any>(`/reviews/${id}`, {
      method: "DELETE",
    }),
}

export const notificationsApi = {
  create: (data: { userId: string; type: string; title: string; message: string; metadata?: any }) =>
    apiRequest<any>(`/notifications`, {
      method: "POST",
      data,
    }),

  getAll: () =>
    apiRequest<any[]>(`/notifications`, {
      method: "GET",
    }),

  getByUserId: (userId: string) =>
    apiRequest<any[]>(`/notifications/user/${userId}`, {
      method: "GET",
    }),

  getUnread: (userId: string) =>
    apiRequest<any[]>(`/notifications/user/${userId}/unread`, {
      method: "GET",
    }),

  getCount: (userId: string) =>
    apiRequest<{ total: number; unread: number }>(`/notifications/user/${userId}/count`, {
      method: "GET",
    }),

  getById: (id: string) =>
    apiRequest<any>(`/notifications/${id}`, {
      method: "GET",
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/notifications/${id}`, {
      method: "PUT",
      data,
    }),

  markAsRead: (id: string) =>
    apiRequest<any>(`/notifications/${id}/read`, {
      method: "PUT",
    }),

  markAllAsRead: (userId: string) =>
    apiRequest<any>(`/notifications/user/${userId}/read-all`, {
      method: "PUT",
    }),

  delete: (id: string) =>
    apiRequest<any>(`/notifications/${id}`, {
      method: "DELETE",
    }),

  deleteAllByUser: (userId: string) =>
    apiRequest<any>(`/notifications/user/${userId}/all`, {
      method: "DELETE",
    }),
}

export const listingsApi = {
  getAll: (filters?: { location?: string; priceMin?: number; priceMax?: number; status?: string }) =>
    roomsApi.browse(filters).then((listings) => ({ listings, total: listings.length })),

  getById: (id: string) => roomsApi.getById(id),

  create: (data: any) => roomsApi.create(data),

  update: (id: string, data: any) => roomsApi.update(id, data),

  close: (id: string) => roomsApi.update(id, { status: "CLOSED" }),
}

export const interestsApi = {
  getAll: (filters?: { hostId?: string; status?: string }) => {
    if (filters?.hostId) {
      return roommateMatchingApi
        .getInterestsForHost(filters.hostId, { status: filters.status })
        .then((interests) => ({ interests, total: interests.length }))
    }
    return Promise.resolve({ interests: [], total: 0 })
  },

  create: (data: { hostId: string; seekerId: string; message?: string; roomId: string }) => {
    const token = tokenStorage.get()
    const payload = token ? jwtUtil.decode(token) : null
    const seekerId = payload?.sub || payload?.id

    if (!seekerId) {
      return Promise.reject(new ApiError("User not authenticated", 401))
    }

    return roommateMatchingApi.createInterest({ ...data, seekerId, hostId: data.hostId })
  },

  accept: (id: string) =>
    roommateMatchingApi.acceptInterest(id).then((result) => ({ interest: result, match: result })),

  reject: (id: string, reason?: string) => roommateMatchingApi.rejectInterest(id),
}

export const matchesApi = {
  getAll: (userId?: string) => {
    let uid = userId
    if (!uid || uid === "current_user") {
      const token = tokenStorage.get()
      const payload = token ? jwtUtil.decode(token) : null
      uid = payload?.sub || payload?.id
    }

    if (!uid) {
      return Promise.reject(new ApiError("User not authenticated", 401))
    }

    return roommateMatchingApi
      .getAllMatches(uid)
      .then((matches) => ({ ...matches, total: (matches.asHost?.length || 0) + (matches.asSeeker?.length || 0) }))
  },
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}
