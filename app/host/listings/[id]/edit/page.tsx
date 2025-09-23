import { Navigation } from "@/components/navigation"
import { EditListing } from "@/components/edit-listing"

interface EditListingPageProps {
  params: {
    id: string
  }
}

export default function EditListingPage({ params }: EditListingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <EditListing listingId={params.id} />
      </main>
    </div>
  )
}
