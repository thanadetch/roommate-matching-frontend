import { Navigation } from "@/components/navigation"
import { ListingDetail } from "@/components/listing-detail"

interface ListingPageProps {
  params: {
    id: string
  }
}

export default function ListingPage({ params }: ListingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <ListingDetail listingId={params.id} />
      </main>
    </div>
  )
}
