"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { tokenStorage, jwt } from "@/lib/api-client"

type Status = "checking" | "allowed" | "redirect"

function isTokenValid(t: string | null) {
  if (!t) return false
  try {
    const payload = jwt.decode(t) as { exp?: number } | null
    if (!payload?.exp) {
      return true 
    }
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
    setStatus("checking")

    const isPublic = pathname === "/login" || pathname === "/register"
    const t = tokenStorage.get()
    const authed = isTokenValid(t)

    if (!authed && !isPublic) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      setStatus("redirect")
      return
    }

    if (authed && isPublic) {
      router.replace("/")
      setStatus("redirect")
      return
    }

    setStatus("allowed")
  }, [pathname, router])

  if (status !== "allowed") {
    return null
  }

  return <>{children}</>
}
