import { MobileHeader } from "@/components/mobile-header"
import { HeroSection } from "@/components/hero-section"

export default function HomePage() {
  return (
    <div className="mobile-full-height flex flex-col bg-background">
      <MobileHeader title="Tourist Safety Shield" showNotifications={false} />
      <main className="flex-1 overflow-y-auto hide-scrollbar">
        <HeroSection />
      </main>
    </div>
  )
}
