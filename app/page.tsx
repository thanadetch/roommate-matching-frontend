import { Navigation } from "@/components/navigation"
import { BrowseListings } from "@/components/browse-listings"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <BrowseListings />
      </main>
    </div>
  )
}
