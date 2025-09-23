import { Navigation } from "@/components/navigation"
import { ReviewsManagement } from "@/components/reviews-management"

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <ReviewsManagement />
      </main>
    </div>
  )
}
