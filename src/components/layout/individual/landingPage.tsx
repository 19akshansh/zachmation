import { CtaFooter } from "../landing/ctaFooter";
import { Credentials } from "../landing/credentials";
import { Faq } from "../landing/faq";
import { Features } from "../landing/features";
import { Hero } from "../landing/hero";
import { HowItWorks } from "../landing/howItWorks";
import { Nav } from "../landing/nav";
import { Pricing } from "../landing/pricing";

export default function LandingPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Credentials />
        <Pricing />
        <Faq />
      </main>
      <CtaFooter />
    </div>
  );
}
