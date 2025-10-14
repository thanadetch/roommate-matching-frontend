import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.roommatch.com"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
})

export const tokenStorage = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null),
  set: (t: string) => localStorage.setItem("auth_token", t),
  clear: () => localStorage.removeItem("auth_token"),
}

apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (client-side only)
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

const base = "/roommate-matching-gateway"
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

export const matchingApi = {
  getInterests: () => apiRequest<{ pending: any[]; accepted: any[]; rejected: any[] }>(`/roommate-matching-gateway/interests`, { method: "GET" }),

  acceptInterest: (id: string) =>
    apiRequest<any>(`/roommate-matching-gateway/interests/${id}/accept`, { method: "POST" }),

  rejectInterest: (id: string, reason?: string) =>
    apiRequest<any>(`/roommate-matching-gateway/interests/${id}/reject`, { method: "POST", data: { reason } }),

  getAllMatches: () =>
    apiRequest<{ asHost: any[]; asSeeker: any[] }>(`/roommate-matching-gateway/matches`, { method: "GET" }),

  getMatchesByUser: (userId: string) =>
    apiRequest<{ asHost: any[]; asSeeker: any[] }>(`/roommate-matching-gateway/matches/${userId}`, { method: "GET" }),

  deleteMatch: (id: string) =>
    apiRequest<any>(`/roommate-matching-gateway/matches/${id}`, { method: "DELETE" }),
}

export const jwt = {
  decode: (token: string) => {
    try {
      const [, payload] = token.split(".")
      return JSON.parse(typeof window !== "undefined" ? atob(payload) : Buffer.from(payload, "base64").toString())
    } catch {
      return null
    }
  },
}

// Profile API functions
export const profileApi = {
  // GET /profiles/email/:email
  getByEmail: (email: string) =>
    apiRequest<{ result?: any }>(`/profiles/email/${encodeURIComponent(email)}`, { method: "GET" }),

  // GET /profiles/:id
  getById: (id: string) => apiRequest<{ result?: any }>(`/profiles/${id}`, { method: "GET" }),

  // PUT /profiles/:id
  updateById: (id: string, data: any) =>
    apiRequest<any>(`/profiles/${id}`, {
      method: "PUT",
      data,
    }),

  // (ถ้าจำเป็นต้องสร้างใหม่) POST /profiles
  create: (data: any) =>
    apiRequest<any>(`/profiles`, {
      method: "POST",
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
  // GET /reviews?reviewerId=...
  getGivenBy: (reviewerId: string) =>
    apiRequest<{ results: any[] }>(`/reviews`, {
      method: "GET",
      params: { reviewerId },
    }),

  // GET /reviews?revieweeId=...
  getForUser: (revieweeId: string) =>
    apiRequest<{ results: any[] }>(`/reviews`, {
      method: "GET",
      params: { revieweeId },
    }),

  // POST /reviews  (reviewerId จะอ่านจาก JWT ใน gateway)
  create: (data: { revieweeId: string; rating: number; comment?: string }) =>
    apiRequest<any>(`/reviews`, {
      method: "POST",
      data,
    }),

  // PUT /reviews/:id
  update: (id: string, data: { rating?: number; comment?: string; revieweeId?: string }) =>
    apiRequest<any>(`/reviews/${id}`, {
      method: "PUT",
      data,
    }),

  // DELETE /reviews/:id
  delete: (id: string) =>
    apiRequest<any>(`/reviews/${id}`, {
      method: "DELETE",
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
  // สร้างห้อง (listing)
  create: (data: {
    title: string
    location: string
    pricePerMonth: number
    availableFrom?: string | null
    description?: string
    rules?: { noSmoking?: boolean; noPet?: boolean }
    hostId?: string // จะอัดจาก JWT ฝั่ง frontend ถ้า backend ยังไม่อ่านจาก token
  }) =>
    apiRequest<any>("/rooms", {
      method: "POST",
      data,
    }),

  // ดึงทั้งหมด (ถ้าต้องการ filter ฝั่ง backend ค่อยเพิ่ม query ภายหลัง)
  getAll: () =>
    apiRequest<any[]>("/rooms", {
      method: "GET",
    }),

  // browse สำหรับหน้า explore (รองรับ query ภายหลัง)
  browse: async (filters?: { location?: string; priceMin?: number; priceMax?: number; status?: string }) => {
    const raw = await apiRequest<any>("/rooms/browse", { method: "GET", params: filters })

    // รองรับหลาย shape ที่ backend อาจส่งมา
    const list =
      Array.isArray(raw) ? raw :
      raw?.results ??
      raw?.data ??
      raw?.rooms ??
      raw?.listings ??
      [];

    // map snake_case -> camelCase เผื่อ backend ส่งแบบนี้มา
    const normalized = list.map((r: any) => ({
      id: r.id,
      title: r.title,
      location: r.location,
      pricePerMonth: r.pricePerMonth ?? r.price_per_month ?? r.price ?? 0,
      status: r.status ?? "OPEN",
      description: r.description ?? "",
      availableFrom: r.availableFrom ?? r.available_from ?? r.availableDate ?? null,
      rules: {
        noSmoking: r.rules?.noSmoking ?? r.rules?.no_smoking ?? r.noSmoking ?? false,
        noPet:     r.rules?.noPet     ?? r.rules?.no_pet     ?? r.noPet     ?? false,
      },
      hostId: r.hostId ?? r.host_id ?? r.ownerId ?? undefined,
      createdAt: r.createdAt ?? r.created_at ?? undefined,
    }))

    return normalized
  },


  // GET /rooms/:id
  getById: (id: string) => apiRequest<any>(`/rooms/${id}`, { method: "GET" }),

  // อัปเดต
  update: (id: string, data: any) =>
    apiRequest<any>(`/rooms/${id}`, {
      method: "PUT",
      data,
    }),

  // ลบ
  remove: (id: string) =>
    apiRequest<any>(`/rooms/${id}`, {
      method: "DELETE",
    }),
}