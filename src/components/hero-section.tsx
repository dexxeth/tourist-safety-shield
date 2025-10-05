import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, MapPin, AlertTriangle, Users, Download, Star } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* App Icon and Title */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tourist Safety Shield</h1>
          <p className="text-muted-foreground mb-4">Your personal safety companion for secure travel</p>

          {/* App Store Style Rating */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">4.9 • 10K+ users</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Link href="/register" className="block">
            <Button size="lg" className="w-full text-lg py-6 rounded-2xl">
              <Download className="h-5 w-5 mr-2" />
              Get Started Free
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="outline" size="lg" className="w-full text-lg py-6 rounded-2xl bg-transparent">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Feature Cards - Mobile Optimized */}
        <div className="space-y-4 mb-8">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Digital ID</h3>
                  <p className="text-muted-foreground text-sm">
                    Secure blockchain-based digital tourist identification with government recognition
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">SOS Emergency</h3>
                  <p className="text-muted-foreground text-sm">
                    Instant emergency alerts to authorities and your emergency contacts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Smart Routes</h3>
                  <p className="text-muted-foreground text-sm">
                    AI-powered safer route recommendations and geo-fencing alerts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">AI Monitoring</h3>
                  <p className="text-muted-foreground text-sm">
                    Intelligent anomaly detection and real-time safety scoring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="bg-card rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold text-card-foreground mb-4">Trusted Worldwide</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary mb-1">10K+</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">50+</div>
              <div className="text-xs text-muted-foreground">Countries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
