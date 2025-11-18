import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-transparent to-muted py-12 px-4 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 pb-8 lg:pb-16">
        <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <span className="text-foreground/30">•</span>
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Terms of Service
            </Link>
          </div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide">
            <Icon icon="mdi:copyright" className="h-3.5 w-3.5" />
            <span>2025 DeathMatters. All rights reserved.</span>
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 justify-center md:justify-start">
            <p className="text-xs text-muted-foreground">
              Crafted with intention to honor every story.
            </p>
          </div>
          <div className="flex flex-1 justify-center gap-2 md:justify-end">
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
        </div>
      </div>
    </footer>
  );
};