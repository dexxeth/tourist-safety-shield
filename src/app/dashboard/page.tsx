import { MobileHeader } from "@/components/mobile-header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { DashboardContent } from "@/components/dashboard-content"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="mobile-full-height flex flex-col bg-background">
        <MobileHeader title="Dashboard" />
        <main className="flex-1 overflow-y-auto hide-scrollbar pb-16">
          <DashboardContent />
        </main>
        <MobileBottomNav />
      </div>
    </AuthGuard>
  )
}
