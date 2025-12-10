"use client";

import { OrganizationSwitcher, SignedIn } from "@clerk/nextjs";
import type { ReactNode } from "react";

type OrganizationSwitcherClientProps = {
  hidePersonal?: boolean;
  afterSelectOrganizationUrl?: string;
  appearance?: React.ComponentProps<typeof OrganizationSwitcher>["appearance"];
  before?: ReactNode;
  after?: ReactNode;
};

export const OrganizationSwitcherClient = ({
  hidePersonal = true,
  afterSelectOrganizationUrl = "/dashboard",
  appearance,
  before,
  after,
}: OrganizationSwitcherClientProps) => {
  return (
    <SignedIn>
      {before}
      <div className="mt-4 px-2">
        <OrganizationSwitcher
          hidePersonal={hidePersonal}
          afterSelectOrganizationUrl={afterSelectOrganizationUrl}
          appearance={appearance}
        />
      </div>
      {after}
    </SignedIn>
  );
};
