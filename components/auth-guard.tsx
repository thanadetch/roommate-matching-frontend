"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { tokenStorage, jwt } from "@/lib/api-client"

type Status = "checking" | "allowed" | "redirect"

function isTokenValid(t: string | null) {
  if (!t) return false
  try {
    const payload = jwt.decode(t) as { exp?: number } | null
    if (!payload?.exp) return true // ถ้าไม่มี exp ก็ถือว่าใช้ได้ (หรือเปลี่ยนเป็น false ตามนโยบาย)
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [status, setStatus] = useState<Status>("checking")

  useEffect(() => {
    // ทุกครั้งที่ path เปลี่ยน ให้กลับไปตรวจใหม่
    setStatus("checking")

    const isPublic = pathname === "/login" || pathname === "/register"
    const t = tokenStorage.get()
    const authed = isTokenValid(t)

    if (!authed && !isPublic) {
      // ยังไม่ล็อกอิน แถมพยายามเข้าเพจ protected → เด้งไป login
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      setStatus("redirect")
      return
    }

    if (authed && isPublic) {
      // ล็อกอินแล้วแต่เปิด /login หรือ /register → ส่งกลับหน้าหลักกันแฟลช
      router.replace("/")
      setStatus("redirect")
      return
    }

    setStatus("allowed")
  }, [pathname, router])

  // ระหว่างตรวจ/กำลัง redirect → ยังไม่ render children เพื่อกันแฟลช
  if (status !== "allowed") {
    return null
    // หรือจะใส่ส keleton ก็ได้ เช่น:
    // return <div className="fixed inset-0 grid place-items-center text-sm text-muted-foreground">Loading…</div>
  }

  return <>{children}</>
}
