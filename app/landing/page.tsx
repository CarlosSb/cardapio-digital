import dynamic from "next/dynamic"
import { LandingHeader } from "@/components/landing-header"

// Lazy load sections below the fold with loading states
const HeroSection = dynamic(() => import("@/components/landing/hero-section"), {
  loading: () => <div className="h-96 bg-muted/20 animate-pulse" />
})
const FeaturesSection = dynamic(() => import("@/components/landing/features-section"), {
  loading: () => <div className="h-96 bg-muted/20 animate-pulse" />
})
const PricingSection = dynamic(() => import("@/components/landing/pricing-section"), {
  loading: () => <div className="h-96 bg-muted/20 animate-pulse" />
})
const TestimonialsSection = dynamic(() => import("@/components/landing/testimonials-section"), {
  loading: () => <div className="h-96 bg-muted/20 animate-pulse" />
})
const CTASection = dynamic(() => import("@/components/landing/cta-section"), {
  loading: () => <div className="h-96 bg-muted/20 animate-pulse" />
})
const Footer = dynamic(() => import("@/components/landing/footer"), {
  loading: () => <div className="h-32 bg-muted/20 animate-pulse" />
})

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <LandingHeader />

      {/* Above the fold - load immediately */}
      <HeroSection />

      {/* Below the fold - lazy load */}
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}