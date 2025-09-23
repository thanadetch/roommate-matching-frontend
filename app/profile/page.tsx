import { Navigation } from "@/components/navigation"
import { ProfileForm } from "@/components/profile-form"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <ProfileForm />
      </main>
    </div>
  )
}
