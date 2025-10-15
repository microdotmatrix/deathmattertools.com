import { ContactSection } from "@/components/email/contact-form";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-background to-muted py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto pb-12 lg:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ContactSection />

          <div>
            <h4 className="font-bold mb-6">Connect With Us</h4>
            <div className="flex gap-2 mb-8">
              <Button variant="outline" size="icon" asChild>
                <Link
                  href="https://www.youtube.com/channel/UCr3gcQSRhFdEelf0MxRDcig"
                  aria-label="YouTube"
                >
                  <Icon icon="simple-icons:youtube" className="size-6" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link
                  href="https://www.instagram.com/deathchatpod"
                  aria-label="Instagram"
                >
                  <Icon icon="simple-icons:instagram" className="size-6" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href="#" aria-label="Facebook">
                  <Icon icon="simple-icons:facebook" className="size-6" />
                </Link>
              </Button>
            </div>

            <Separator className="my-8" />

            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </p>
              <p>
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </p>
              <p className="flex items-center gap-1 mt-12">
                <Icon icon="mdi:copyright" className="-mt-0.5" />{" "}
                <span className="font-semibold">2025 DeathMatters.</span> All
                rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};