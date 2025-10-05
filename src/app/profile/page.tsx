import { MobileHeader } from "@/components/mobile-header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { ProfileSettings } from "@/components/profile-settings"
import { AuthGuard } from "@/components/auth-guard"

export default function ProfilePage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="mobile-full-height flex flex-col bg-background">
        <MobileHeader title="Profile" />
        <main className="flex-1 overflow-y-auto hide-scrollbar pb-16">
          <div className="px-4 py-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Profile & Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account and safety preferences</p>
            </div>
            <ProfileSettings />
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </AuthGuard>
  )
}
