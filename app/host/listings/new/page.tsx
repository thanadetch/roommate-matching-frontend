import { Navigation } from "@/components/navigation"
import { CreateListing } from "@/components/create-listing"

export default function CreateListingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <CreateListing />
      </main>
    </div>
  )
}
