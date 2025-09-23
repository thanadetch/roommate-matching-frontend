import { Navigation } from "@/components/navigation"
import { MyListings } from "@/components/my-listings"

export default function MyListingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <MyListings />
      </main>
    </div>
  )
}
