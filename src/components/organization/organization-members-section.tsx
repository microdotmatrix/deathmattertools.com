"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Icon } from "@/components/ui/icon";
import { OrganizationProfile, SignedIn } from "@clerk/nextjs";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const OrganizationMembersSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:account-group" className="size-5" aria-hidden="true" />
                Team Management
              </CardTitle>
              <ChevronDown
                className="size-5 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180"
                data-state={isOpen ? "open" : "closed"}
              />
            </div>
            <CardDescription>
              Invite team members, manage roles, and configure organization settings.
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-6 pb-6">
            <SignedIn>
              <OrganizationProfile
                routing="hash"
                appearance={{
                  // elements: {
                  //   rootBox: "w-full max-w-none",
                  //   cardBox: "w-full max-w-none",
                  //   card: "shadow-none border-0 w-full max-w-none",
                  //   scrollBox: "w-full max-w-none overflow-visible",
                  //   pageScrollBox: "p-0 w-full max-w-none overflow-visible",
                  //   navbar: "hidden",
                  // },
                }}
              />
            </SignedIn>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
