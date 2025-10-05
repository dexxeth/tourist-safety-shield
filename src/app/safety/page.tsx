import { MobileHeader } from "@/components/mobile-header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { SafetyAlerts } from "@/components/safety-alerts"
import { SaferRoutesWidget } from "@/components/safer-routes-widget"
import { LocationTracker } from "@/components/location-tracker"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Shield } from "lucide-react"

export default function SafetyPage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="mobile-full-height flex flex-col bg-background">
        <MobileHeader title="Safety" />
        <main className="flex-1 overflow-y-auto hide-scrollbar pb-16">
          <div className="px-4 py-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Safety Center</h1>
              <p className="text-sm text-muted-foreground">Monitor your safety and get real-time alerts</p>
            </div>

            {/* Safety Overview */}
            <Card className="rounded-2xl mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Safety Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 mb-1">92</div>
                    <div className="text-xs text-muted-foreground">Safety Score</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 mb-1">Safe</div>
                    <div className="text-xs text-muted-foreground">Current Zone</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Tracking */}
            <div className="mb-6">
              <LocationTracker />
            </div>

            {/* Safety Alerts */}
            <div className="mb-6">
              <SafetyAlerts />
            </div>

            {/* Safer Routes */}
            <div className="mb-6">
              <SaferRoutesWidget />
            </div>

            {/* Emergency Contacts */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div>
                      <div className="font-medium text-sm">Local Police</div>
                      <div className="text-xs text-muted-foreground">100</div>
                    </div>
                    <div className="text-xs text-green-600">Available</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div>
                      <div className="font-medium text-sm">Tourist Helpline</div>
                      <div className="text-xs text-muted-foreground">1363</div>
                    </div>
                    <div className="text-xs text-green-600">24/7</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div>
                      <div className="font-medium text-sm">Medical Emergency</div>
                      <div className="text-xs text-muted-foreground">108</div>
                    </div>
                    <div className="text-xs text-green-600">Available</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </AuthGuard>
  )
}
