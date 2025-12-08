"use client";

import type { TransitionId } from "@/lib/utils/transition-ids";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    addTransitionType,
    startTransition,
    ViewTransition,
} from "react";

type ViewTransitionClass = string;

/**
 * Client component that wraps entry links with view transition support.
 * Triggers startTransition when navigating to enable shared element transitions.
 */
export const EntryLink = ({
  href,
  children,
  className,
  transitionName,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  transitionName?: TransitionId;
} & Omit<React.ComponentProps<typeof Link>, "href">) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    startTransition(() => {
      addTransitionType("transition-to-detail");
      router.push(href);
    });
  };

  const link = (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );

  // If a transition name is provided, wrap in ViewTransition for shared element morphing
  if (transitionName) {
    return (
      <ViewTransition name={transitionName} share="animate-morph">
        {link}
      </ViewTransition>
    );
  }

  return link;
};

/**
 * Client component for entry thumbnail with view transition support.
 * Wraps the thumbnail in a ViewTransition for shared element morphing.
 */
export const EntryThumbnail = ({
  children,
  transitionName,
}: {
  children: React.ReactNode;
  transitionName: TransitionId;
}) => {
  return (
    <ViewTransition name={transitionName} share="animate-morph">
      {children}
    </ViewTransition>
  );
};
