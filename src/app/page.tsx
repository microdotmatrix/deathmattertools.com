import { HeroSection } from "@/components/sections/home/hero";
import { MemorialSection } from "@/components/sections/home/memorial";
import { ObituarySection } from "@/components/sections/home/obituary";
import { QuotesSection } from "@/components/sections/home/quotes";
import { meta } from "@/lib/config";
import type { Metadata } from "next";

// Static marketing page - caching handled by cacheComponents
export const metadata: Metadata = {
  title: "Home",
  description: meta.description,
  openGraph: {
    title: `${meta.title} - Home`,
    description: meta.description,
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Obituary Writer Section */}
      <section id="obituary-writer" className="py-24 lg:py-48 px-4 md:px-6">
        <ObituarySection />
      </section>

      {/* Quote Generator Section */}
      <section
        id="quote-generator"
        className="py-24 lg:py-48 px-4 md:px-6 bg-muted/25"
      >
        <QuotesSection />
      </section>

      {/* Memorial Card/Image Creator Section */}
      <section id="memorial-card" className="py-24 lg:py-48 px-4 md:px-6">
        <MemorialSection />
      </section>
    </main>
  );
}