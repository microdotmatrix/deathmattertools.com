# PRD: Dashboard Shell Refactor for Entry Routes

## Overview

This PRD outlines the plan to persist the `DashboardShell` component across all user-logged-in sub-routes under `src/app/[entryId]`. This ensures a consistent navigation experience (sidebar) when users are managing specific entries, obituaries, and images.

## Goals

- Wrap all routes under `src/app/[entryId]` with the `DashboardShell` layout.
- Ensure the sidebar persists when navigating between entry details, obituaries, and images.
- Maintain existing authentication and access control checks.

## Technical Plan

### 1. Create `src/app/[entryId]/layout.tsx`

A new layout file will be created to serve as the root layout for the `[entryId]` route segment.

```tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReactNode } from "react";

export default function EntryLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
```

### 2. Impact on Existing Pages

- **`src/app/[entryId]/page.tsx`**: Currently renders `EntryEditContent` inside a `main` tag. The `main` tag and container styling might need adjustment to fit nicely within the `DashboardShell`'s content area (which already provides some padding).
  - _Action_: Review padding and containers to avoid double padding.
- **`src/app/[entryId]/obituaries/*`**: These pages will now automatically inherit the shell.
- **`src/app/[entryId]/images/*`**: These pages will now automatically inherit the shell.

### 3. Navigation & Sidebar

- The `DashboardShell` currently displays global dashboard links ("Overview", "Settings", etc.).
- Users navigating deep into an entry will still see these global links, allowing easy return to the main dashboard.

### 4. UI/UX Considerations

- The `DashboardShell` places content in a `SidebarInset` with standard padding (`px-4 pb-10 pt-6 md:px-8 lg:px-10`).
- Existing pages inside `[entryId]` often define their own containers (`container mx-auto px-4 py-6`).
- **Recommendation**: Remove the `container` class from the child pages to allow the `DashboardShell` to handle the main container width/padding, or adjust it to `w-full`.

## Implementation Steps

1. Create `src/app/[entryId]/layout.tsx`.
2. Verify the appearance of `src/app/[entryId]/page.tsx`.
3. Adjust styling in child pages if double-padding occurs.

## Questions/Notes

- Does the sidebar need to show entry-specific links when inside an entry? (Out of scope for this request, assuming global sidebar is desired).
