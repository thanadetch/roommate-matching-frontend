import { Navigation } from "@/components/navigation"
import { NotificationsList } from "@/components/notifications-list"

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <NotificationsList />
      </main>
    </div>
  )
}
