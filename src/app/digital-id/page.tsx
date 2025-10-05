import { MobileHeader } from "@/components/mobile-header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { DigitalIDCard } from "@/components/digital-id-card"
import { IDVerificationStatus } from "@/components/id-verification-status"
import { AuthGuard } from "@/components/auth-guard"

export default function DigitalIDPage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="mobile-full-height flex flex-col bg-background">
        <MobileHeader title="Digital ID" />
        <main className="flex-1 overflow-y-auto hide-scrollbar pb-16">
          <div className="px-4 py-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Your Digital Tourist ID</h1>
              <p className="text-sm text-muted-foreground">Secure, blockchain-based identification for safe travel</p>
            </div>

            {/* Digital ID Card */}
            <div className="mb-6">
              <DigitalIDCard showActions={true} compact={false} />
            </div>

            {/* Verification Status */}
            <div className="mb-6">
              <IDVerificationStatus />
            </div>

            {/* Additional Information - Mobile Cards */}
            <div className="space-y-4">
              <div className="text-center p-4 bg-card rounded-2xl border border-border">
                <h3 className="font-semibold text-base mb-2">Blockchain Secured</h3>
                <p className="text-muted-foreground text-sm">
                  Your ID is secured with advanced blockchain technology ensuring tamper-proof records
                </p>
              </div>
              <div className="text-center p-4 bg-card rounded-2xl border border-border">
                <h3 className="font-semibold text-base mb-2">Government Recognized</h3>
                <p className="text-muted-foreground text-sm">
                  Officially recognized by tourism departments and law enforcement agencies
                </p>
              </div>
              <div className="text-center p-4 bg-card rounded-2xl border border-border">
                <h3 className="font-semibold text-base mb-2">Real-time Updates</h3>
                <p className="text-muted-foreground text-sm">
                  Your safety score and status are updated in real-time based on your travel patterns
                </p>
              </div>
            </div>
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </AuthGuard>
  )
}
