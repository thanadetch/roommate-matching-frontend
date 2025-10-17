import { profileApi, roomsApi } from "@/lib/api-client"

type Cache<T> = Record<string, T>
const profileCache: Cache<any> = {}
const roomCache: Cache<any> = {}

export async function fetchProfileSafe(id?: string) {
  if (!id) return null
  if (profileCache[id]) return profileCache[id]
  try {
    const r = await profileApi.getById(id) // { result?: {...} }
    profileCache[id] = r?.result || null
    return profileCache[id]
  } catch {
    profileCache[id] = null
    return null
  }
}

export async function fetchRoomSafe(id?: string) {
  if (!id) return null
  if (roomCache[id]) return roomCache[id]
  try {
    const r = await roomsApi.getById(id)
    roomCache[id] = r || null
    return roomCache[id]
  } catch {
    roomCache[id] = null
    return null
  }
}

// สร้างชื่อเต็ม
export function fullName(p?: any, fallback?: string) {
  const name = `${p?.firstName ?? ""} ${p?.lastName ?? ""}`.trim()
  return name || fallback || "Unknown"
}

// สร้าง contact
export function contactFromProfile(p?: any) {
  return {
    line: p?.contactLine ?? undefined,
    email: p?.contactEmail ?? p?.email ?? undefined,
  }
}