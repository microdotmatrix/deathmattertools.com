import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Death Matter Tools and our mission to help you create meaningful tributes for your loved ones.",
};

const products = [
  {
    title: "Death Chat",
    description:
      "Honest conversations with real people about death, grief, legacy, and everything in between. Podcasts and short clips on important topics.",
    icon: "mdi:microphone-outline",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    title: "Final Spaces",
    description:
      "An interactive, private or shareable space to document your life, wishes, and stories. Leave behind your digital legacy.",
    icon: "mdi:book-heart-outline",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    title: "Software Tools",
    description:
      "Practical resources for families, funeral professionals, and communities to navigate end-of-life planning.",
    icon: "mdi:tools",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

const team = [
  {
    name: "Julia Spittal",
    role: "Founder &amp; CEO",
    initials: "JS",
    gradient: "from-violet-500/20 to-fuchsia-500/20",
  },
  {
    name: "Mike Bologna",
    role: "Founder &amp; Chief Strategy Officer",
    initials: "MB",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    name: "Andrea Bologna West",
    role: "Founder",
    initials: "AB",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
];

export default function About() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/5 blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Icon icon="mdi:heart-outline" className="size-4" />
            Our Mission
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
            Changing How the World
            <span className="block text-primary">Talks About Death</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            What started as a passion project has grown into Death Matter
            Tools&mdash;conversation, curiosity, and connection around
            life&apos;s final chapter. We&apos;ve developed a range of products
            to help navigate these challenges and make everything easier and
            more emotionally open.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 lg:py-32 px-4 md:px-6 bg-muted/25">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground mb-3">
              What We Do
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Tools for Meaningful Conversations
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              Spaces designed to foster connection, preserve legacies, and make
              difficult conversations a little easier.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product) => (
              <Card
                key={product.title}
                className="group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <CardContent className="p-8 space-y-6">
                  <div
                    className={`inline-flex items-center justify-center size-14 rounded-2xl ${product.bgColor} ${product.color} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon icon={product.icon} className="size-7" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">{product.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 lg:py-32 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground mb-3">
              Our Team
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              The People Behind the Mission
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              A team united by the belief that death deserves more openness,
              compassion, and thoughtful preparation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {team.map((member) => (
              <div
                key={member.name}
                className="group flex flex-col items-center text-center space-y-6"
              >
                <div className="relative">
                  <div
                    className={`absolute inset-0 rounded-full bg-linear-to-br ${member.gradient} blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  <div className="relative size-40 lg:size-48 rounded-full overflow-hidden border-2 border-border/50 bg-linear-to-br from-muted to-muted/50 transition-all duration-300 group-hover:border-primary/30 group-hover:scale-105">
                    <div className="w-full h-full flex items-center justify-center text-4xl lg:text-5xl font-bold text-muted-foreground/60">
                      {member.initials}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p
                    className="text-sm font-medium uppercase tracking-wider text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: member.role }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 lg:py-32 px-4 md:px-6 bg-muted/25">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary mb-8">
            <Icon icon="mdi:compass-outline" className="size-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Our Guiding Principle
          </h2>
          <blockquote className="text-xl md:text-2xl text-muted-foreground leading-relaxed italic">
            &ldquo;Death is not the opposite of life, but a part of it. By
            embracing this truth, we can live more fully and love more
            deeply.&rdquo;
          </blockquote>
        </div>
      </section>
    </main>
  );
}
