"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { tokenStorage } from "@/lib/api-client"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const isPublic = pathname === "/login" || pathname === "/register"
    const t = tokenStorage.get()
    
    if (!t && !isPublic) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [pathname, router])

  return <>{children}</>
}
