import { Navigation } from "@/components/navigation"
import { MatchesView } from "@/components/matches-view"

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <MatchesView />
      </main>
    </div>
  )
}
