import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { QueryProvider } from "@/lib/query-provider"
import AuthGuard from "@/components/auth-guard"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

export const metadata: Metadata = {
  title: "RoomMatch - Find Your Perfect Roommate",
  description: "Connect with compatible roommates and find your ideal living situation",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${spaceGrotesk.variable}`}>
        <QueryProvider>
          <Suspense fallback={null}>
            <AuthGuard>{children}</AuthGuard>
          </Suspense>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
