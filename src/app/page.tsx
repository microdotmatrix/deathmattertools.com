import { MenuTrigger } from "@/components/elements/menu-trigger";
import { Onboarding } from "@/components/sections/home/onboarding";
import { PricingTable } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { has } = await auth();

  const isPro = has({ plan: "pro" });
  return (
    <main className="grid place-items-center h-full">
      <Onboarding />

      <section className="py-8"><MenuTrigger /></section>

      <section className="w-full max-w-screen-md">
        <PricingTable forOrganizations />
      </section>
    </main>
  );
}
