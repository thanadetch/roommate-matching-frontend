import { Navigation } from "@/components/navigation"
import { InterestsManagement } from "@/components/interests-management"

export default function InterestsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <InterestsManagement />
      </main>
    </div>
  )
}
