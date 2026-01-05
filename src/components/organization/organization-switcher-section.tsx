"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { CreateOrganization, OrganizationSwitcher, SignedIn } from "@clerk/nextjs";
import { useState } from "react";

export function OrganizationSwitcherSection() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="mdi:swap-horizontal" className="w-5 h-5" aria-hidden="true" />
          Switch Organization
        </CardTitle>
        <CardDescription>
          Select an organization to manage, or create a new one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignedIn>
          <div className="flex flex-col gap-4">
            <OrganizationSwitcher
              hidePersonal
              afterSelectOrganizationUrl="/dashboard/organization"
              afterCreateOrganizationUrl="/dashboard/organization"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  organizationSwitcherTrigger:
                    "w-full justify-between border rounded-md px-3 py-2 hover:bg-muted",
                },
              }}
            />
            {showCreate && (
              <div className="mt-4">
                <CreateOrganization
                  afterCreateOrganizationUrl="/dashboard/organization"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border",
                    },
                  }}
                />
              </div>
            )}
          </div>
        </SignedIn>
      </CardContent>
    </Card>
  );
}
