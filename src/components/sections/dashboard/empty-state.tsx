"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateForm } from "@/lib/state";
import { Icon } from "@iconify/react";

type FeatureItem = {
  icon: string;
  title: string;
  description: string;
};

const individualFeatures: FeatureItem[] = [
  {
    icon: "mdi:clipboard-text-outline",
    title: "Pre-Need Surveys",
    description: "Take customized surveys to document your wishes and preferences ahead of time.",
  },
  {
    icon: "mdi:robot-outline",
    title: "AI Guidance",
    description: "Learn from AI chatbots or interviews with professionals in the field.",
  },
  {
    icon: "mdi:compass-outline",
    title: "Trusted Resources",
    description: "Find curated resources to guide and support you through this journey.",
  },
];

const professionalFeatures: FeatureItem[] = [
  {
    icon: "mdi:briefcase-outline",
    title: "Business Management",
    description: "Streamline your tasks and obligations with purpose-built tools.",
  },
  {
    icon: "mdi:clock-outline",
    title: "More Time for People",
    description: "Spend less time on administration and more time with the families you serve.",
  },
  {
    icon: "mdi:handshake-outline",
    title: "Enhanced Operations",
    description: "Work with us to strengthen the support you provide to families in their time of need.",
  },
];

const FeatureCard = ({ icon, title, description }: FeatureItem) => (
  <div className="flex items-start gap-4">
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon icon={icon} className="size-5" />
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export const DashboardEmptyState = () => {
  const { setOpen } = useCreateForm();

  return (
    <div className="space-y-10">
      <section className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome to Death Matters Tools</h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Death Matters Tools were designed to make the process of death easier and more
          compassionate. Whether you&apos;re an individual navigating loss or a death care
          professional supporting others, we provide the tools and information you need to guide
          you through what you&apos;re facing.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <Icon icon="mdi:account-heart-outline" className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">For Individuals</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Take our customized pre-need surveys, learn from AI chatbots or interviews with
              professionals in the field, and find trusted resources to guide and support you
              through this journey.
            </p>
            <div className="space-y-5 pt-2">
              {individualFeatures.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Icon icon="mdi:account-tie-outline" className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">For Professionals</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Use our business management tools to streamline your tasks and obligations, giving
              you more time to focus on the people you serve. Work with us to enhance your
              business operations and strengthen the support you provide to families in their
              time of need.
            </p>
            <div className="space-y-5 pt-2">
              {professionalFeatures.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          className="h-14 px-10 text-lg"
          onClick={() => setOpen(true)}
        >
          <Icon icon="mdi:rocket-launch-outline" className="mr-2 size-5" />
          Get Started
        </Button>
      </div>
    </div>
  );
};
