"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Bell, Home, Heart, User, Settings, LogOut, Menu } from "lucide-react"
import { tokenStorage } from "@/lib/api-client"
import { useNotificationCount } from "@/lib/hooks/use-notifications"
import { cn } from "@/lib/utils" // ถ้ามี util รวม clsx/classnames; ถ้าไม่มี ลบ cn ออกแล้วใส่เงื่อนไข className ตรงๆ ได้

const navigationItems = [
  { href: "/", label: "Browse", icon: Home },
  { href: "/host/listings", label: "My Listings", icon: Settings },
  { href: "/matching/interests", label: "Interests", icon: Heart },
  { href: "/matching/matches", label: "Matches", icon: User },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: countData } = useNotificationCount()
  const unreadCount = (countData as { unread: number } | undefined)?.unread || 0

  const handleSignOut = () => {
    tokenStorage.clear()
    router.push("/login")
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">

        {/* left: logo + desktop nav + mobile menu button */}
        <div className="flex items-center gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">RM</span>
            </div>
            <span className="hidden sm:inline font-bold text-xl font-space-grotesk">RoomMatch</span>
          </Link>

          {/* Desktop nav (>= md) */}
          <div className="hidden md:flex items-center space-x-1 ml-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link href={item.href} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              )
            })}
          </div>

          {/* Mobile menu button (< md) */}
          <div className="md:hidden ml-1">
            <MobileMenu pathname={pathname} />
          </div>
        </div>

        {/* right: notifications + profile */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" size="sm" asChild aria-label="Notifications">
            <Link href="/notifications" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/diverse-user-avatars.png" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/reviews">
                  <Heart className="mr-2 h-4 w-4" />
                  Reviews
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </nav>
  )
}

/** Mobile menu drawer (hamburger) */
function MobileMenu({ pathname }: { pathname: string | null }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 rounded-lg",
                  active && "bg-accent"
                )}
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
