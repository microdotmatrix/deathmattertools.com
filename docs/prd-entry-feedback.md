# PRD: Entry Feedback & Collaboration System

**Version:** 1.0  
**Created:** 2025-01-15  
**Status:** Planning  
**Priority:** Medium

---

## Executive Summary

Add a feedback/comments system at the entry level (separate from obituary comments) to enable organization members to provide constructive feedback on entry details, with state management by the entry creator.

---

## Problem Statement

### Current State
- Organization members can view entries created by teammates
- Organization members can comment on obituaries (when enabled)
- **No mechanism** for providing feedback on the entry itself (biographical details, dates, locations, etc.)
- **No workflow** for entry creators to review and address feedback

### User Pain Points
1. Org members spot errors in entry details but have no way to flag them
2. Collaborative fact-checking requires external communication
3. Entry creators don't know what needs review/correction
4. No audit trail of suggested changes or discussions

### Opportunity
Enable structured feedback workflow directly within the application, improving data quality through team collaboration.

---

## Objectives

### Primary Goals
1. Enable organization members to comment on entry details
2. Provide state management workflow (Approve/Deny/Resolve) for creators
3. Display feedback in a dedicated section on entry page
4. Maintain separation from obituary commenting system

### Success Metrics
- Organization members can submit entry feedback
- Entry creators can manage feedback states
- Clear visual distinction from obituary comments
- Audit trail of all feedback and state changes

---

## User Stories

### As an Organization Member (Non-Creator)
- **I want to** comment on entry details I notice need correction
- **So that** the entry creator can review and fix inaccuracies
- **Acceptance:** I can add comments to any org entry, clearly separate from obituary comments

### As an Entry Creator
- **I want to** review feedback from organization members
- **So that** I can approve valuable suggestions and deny invalid ones
- **Acceptance:** I see all feedback with ability to approve/deny/resolve each comment

### As Any User
- **I want to** see the current state of feedback items
- **So that** I know what's been addressed and what's pending
- **Acceptance:** Visual indicators show pending/approved/denied/resolved states

---

## Technical Architecture

### Database Schema

#### New Table: `entry_feedback`

```typescript
export const EntryFeedbackTable = pgTable("entry_feedback", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  
  // Relationships
  entryId: text("entry_id")
    .notNull()
    .references(() => EntryTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => UserTable.id),
  
  // Content
  content: text("content").notNull(),
  
  // State Management
  status: text("status")
    .notNull()
    .default("pending"), // pending | approved | denied | resolved
  
  // Metadata
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  
  // State change tracking
  statusChangedAt: timestamp("status_changed_at"),
  statusChangedBy: text("status_changed_by")
    .references(() => UserTable.id),
}, (table) => ({
  entryIdIdx: index("entry_feedback_entry_id_idx").on(table.entryId),
  statusIdx: index("entry_feedback_status_idx").on(table.status),
}));
```

#### Type Definitions

```typescript
export type EntryFeedbackStatus = "pending" | "approved" | "denied" | "resolved";

export type EntryFeedback = typeof EntryFeedbackTable.$inferSelect;

export interface EntryFeedbackWithUser extends EntryFeedback {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}
```

### State Machine

```
┌─────────┐
│ Pending │ (default state when created)
└────┬────┘
     │
     ├──────────┐
     ▼          ▼
┌──────────┐  ┌─────────┐
│ Approved │  │ Denied  │
└────┬─────┘  └─────────┘
     │
     ▼
┌───────────┐
│ Resolved  │ (final state)
└───────────┘
```

**State Transitions:**
- **Pending → Approved:** Creator agrees with feedback
- **Pending → Denied:** Creator disagrees with feedback
- **Approved → Resolved:** Creator has addressed the feedback
- **Denied → Pending:** Creator reconsiders (optional)

**Rules:**
- Only entry creator can change status
- Feedback author can edit/delete their own pending feedback
- Once resolved/denied, feedback is read-only

---

## Access Control

### Who Can Comment?
- ✅ Entry creator (owner)
- ✅ Organization members (same org as entry)
- ❌ Users outside the organization
- ❌ Users viewing entries without org membership

### Who Can Manage States?
- ✅ Entry creator only
- ❌ Feedback authors cannot change status
- ❌ Other org members cannot change status

### Permissions Matrix

| Action | Creator | Org Member | Non-Org User |
|--------|---------|------------|--------------|
| View Feedback | ✅ | ✅ | ❌ |
| Add Feedback | ✅ | ✅ | ❌ |
| Edit Own Feedback | ✅ | ✅* | ❌ |
| Delete Own Feedback | ✅ | ✅* | ❌ |
| Approve/Deny | ✅ | ❌ | ❌ |
| Resolve | ✅ | ❌ | ❌ |

*Only for pending feedback

---

## UI/UX Design

### Entry Page Layout

```
┌─────────────────────────────────────────────────────┐
│ Entry Page Header                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────┐  ┌──────────────────────┐ │
│ │ Entry Details       │  │ Obituary Details     │ │
│ └─────────────────────┘  └──────────────────────┘ │
│                                                     │
│ ┌─────────────────────┐  ┌──────────────────────┐ │
│ │ Photos & Images     │  │ Obituaries List      │ │
│ └─────────────────────┘  └──────────────────────┘ │
│                                                     │
│ ┌──────────────────────────────────────────────── │
│ │ 💬 Entry Feedback & Collaboration       [NEW]  │ │
│ ├───────────────────────────────────────────────┤ │
│ │ [Add Feedback Button - Org Members Only]      │ │
│ │                                               │ │
│ │ 📌 Pending (2)                                │ │
│ │ ┌─────────────────────────────────────────┐  │ │
│ │ │ 👤 John Doe · 2 hours ago               │  │ │
│ │ │ "Birth date seems off by a year..."     │  │ │
│ │ │ [Approve] [Deny] [Edit] [Delete]        │  │ │
│ │ └─────────────────────────────────────────┘  │ │
│ │                                               │ │
│ │ ✅ Approved (1)                               │ │
│ │ ✓ Resolved (3)                                │ │
│ │ ❌ Denied (1)                                 │ │
│ └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Feedback Card States

#### Pending (Default)
```
┌─────────────────────────────────────────────┐
│ 🕐 Pending                                  │
│ 👤 Jane Smith · 3 hours ago                 │
│ "Location died should be 'Chicago, IL'"    │
│                                             │
│ [Creator Only]                              │
│ [✓ Approve]  [✗ Deny]                      │
│                                             │
│ [Author Only]                               │
│ [Edit] [Delete]                             │
└─────────────────────────────────────────────┘
```

#### Approved
```
┌─────────────────────────────────────────────┐
│ ✅ Approved by Creator                      │
│ 👤 Jane Smith · 3 hours ago                 │
│ "Location died should be 'Chicago, IL'"    │
│                                             │
│ [Creator Only]                              │
│ [✓ Mark as Resolved]                       │
└─────────────────────────────────────────────┘
```

#### Resolved
```
┌─────────────────────────────────────────────┐
│ ✓ Resolved · Updated yesterday              │
│ 👤 Jane Smith · 3 days ago                  │
│ "Location died should be 'Chicago, IL'"    │
│                                             │
│ [Read Only]                                 │
└─────────────────────────────────────────────┘
```

#### Denied
```
┌─────────────────────────────────────────────┐
│ ❌ Denied by Creator                        │
│ 👤 Jane Smith · 3 hours ago                 │
│ "Incorrect birth year"                     │
│                                             │
│ [Read Only]                                 │
└─────────────────────────────────────────────┘
```

### Visual Design

**Color Coding:**
- 🕐 **Pending:** Amber/Yellow border + icon
- ✅ **Approved:** Green border + checkmark
- ✓ **Resolved:** Muted/gray with checkmark
- ❌ **Denied:** Red border + X icon

**Sections:**
- Collapsible sections by status
- Badge counts next to each status header
- Default: Pending expanded, others collapsed

---

## Implementation Plan

### Phase 1: Database & Schema (2-3 hours)
**Priority:** HIGH

- [ ] Create `entry_feedback` table schema
- [ ] Add indexes for performance
- [ ] Create TypeScript types
- [ ] Generate and apply migration
- [ ] Add relations to Entry and User tables

**Files:**
- New: `src/lib/db/schema/entry-feedback.ts`
- Update: `src/lib/db/schema/index.ts`
- New: `drizzle/migrations/XXXX_entry_feedback.sql`

---

### Phase 2: Query & Mutation Layer (3-4 hours)
**Priority:** HIGH

#### Queries

```typescript
// src/lib/db/queries/entry-feedback.ts

export const getEntryFeedback = cache(async (entryId: string) => {
  const { userId, orgId } = await auth();
  
  // Verify user has access to entry
  const access = await getEntryWithAccess(entryId);
  if (!access) return null;
  
  // Fetch feedback with user info
  const feedback = await db.query.EntryFeedbackTable.findMany({
    where: eq(EntryFeedbackTable.entryId, entryId),
    with: {
      user: {
        columns: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [desc(EntryFeedbackTable.createdAt)],
  });
  
  return feedback;
});

export const getFeedbackByStatus = cache(
  async (entryId: string, status: EntryFeedbackStatus) => {
    const feedback = await getEntryFeedback(entryId);
    if (!feedback) return [];
    
    return feedback.filter((f) => f.status === status);
  }
);
```

#### Mutations

```typescript
// src/lib/db/mutations/entry-feedback.ts

const CreateFeedbackSchema = z.object({
  entryId: z.string(),
  content: z.string().min(1).max(2000),
});

export const createEntryFeedback = action(
  CreateFeedbackSchema,
  async (data) => {
    const { userId, orgId } = await auth();
    
    if (!userId) return { error: "Unauthorized" };
    
    // Verify user has access to entry
    const access = await getEntryWithAccess(data.entryId);
    if (!access || !access.canView) {
      return { error: "Forbidden" };
    }
    
    try {
      await db.insert(EntryFeedbackTable).values({
        entryId: data.entryId,
        userId,
        content: data.content,
        status: "pending",
      });
      
      revalidatePath(`/${data.entryId}`);
      return { success: true };
    } catch (error) {
      return { error: "Failed to create feedback" };
    }
  }
);

export const updateFeedbackStatus = action(
  z.object({
    feedbackId: z.string(),
    status: z.enum(["approved", "denied", "resolved"]),
  }),
  async (data) => {
    const { userId } = await auth();
    
    if (!userId) return { error: "Unauthorized" };
    
    // Get feedback and verify ownership
    const feedback = await db.query.EntryFeedbackTable.findFirst({
      where: eq(EntryFeedbackTable.id, data.feedbackId),
      with: {
        entry: true,
      },
    });
    
    if (!feedback) return { error: "Feedback not found" };
    
    // Only entry creator can change status
    if (feedback.entry.userId !== userId) {
      return { error: "Only entry creator can manage feedback" };
    }
    
    try {
      await db
        .update(EntryFeedbackTable)
        .set({
          status: data.status,
          statusChangedAt: new Date(),
          statusChangedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(EntryFeedbackTable.id, data.feedbackId));
      
      revalidatePath(`/${feedback.entryId}`);
      return { success: true };
    } catch (error) {
      return { error: "Failed to update status" };
    }
  }
);
```

**Files:**
- New: `src/lib/db/queries/entry-feedback.ts`
- New: `src/lib/db/mutations/entry-feedback.ts`

---

### Phase 3: UI Components (4-5 hours)
**Priority:** HIGH

#### Component Structure

```
src/components/sections/entry-feedback/
├── entry-feedback-panel.tsx       # Main container
├── feedback-card.tsx              # Individual feedback item
├── feedback-form.tsx              # Add feedback form
├── feedback-status-section.tsx   # Collapsible status sections
└── feedback-actions.tsx           # Approve/Deny/Resolve buttons
```

#### Key Components

**EntryFeedbackPanel**
```typescript
// src/components/sections/entry-feedback/entry-feedback-panel.tsx

export const EntryFeedbackPanel = async ({
  entryId,
  canManage,
}: {
  entryId: string;
  canManage: boolean;
}) => {
  const feedback = await getEntryFeedback(entryId);
  
  if (!feedback) {
    return <div>No access to feedback</div>;
  }
  
  const pending = feedback.filter((f) => f.status === "pending");
  const approved = feedback.filter((f) => f.status === "approved");
  const resolved = feedback.filter((f) => f.status === "resolved");
  const denied = feedback.filter((f) => f.status === "denied");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entry Feedback & Collaboration</CardTitle>
        <CardDescription>
          Organization members can provide feedback to improve entry accuracy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FeedbackForm entryId={entryId} />
        
        <FeedbackStatusSection
          title="Pending Review"
          icon="mdi:clock-outline"
          status="pending"
          feedback={pending}
          canManage={canManage}
          defaultOpen={true}
        />
        
        <FeedbackStatusSection
          title="Approved"
          icon="mdi:check-circle"
          status="approved"
          feedback={approved}
          canManage={canManage}
        />
        
        <FeedbackStatusSection
          title="Resolved"
          icon="mdi:check"
          status="resolved"
          feedback={resolved}
          canManage={false}
        />
        
        <FeedbackStatusSection
          title="Denied"
          icon="mdi:close-circle"
          status="denied"
          feedback={denied}
          canManage={false}
        />
      </CardContent>
    </Card>
  );
};
```

**FeedbackCard**
```typescript
// src/components/sections/entry-feedback/feedback-card.tsx

export const FeedbackCard = ({
  feedback,
  canManage,
  isAuthor,
}: {
  feedback: EntryFeedbackWithUser;
  canManage: boolean;
  isAuthor: boolean;
}) => {
  return (
    <div className={cn(
      "p-4 rounded-lg border",
      statusStyles[feedback.status]
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={feedback.status} />
          <span className="text-sm font-medium">
            {feedback.user.firstName} {feedback.user.lastName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(feedback.createdAt)} ago
          </span>
        </div>
      </div>
      
      <p className="mt-2 text-sm">{feedback.content}</p>
      
      {canManage && feedback.status === "pending" && (
        <FeedbackActions
          feedbackId={feedback.id}
          actions={["approve", "deny"]}
        />
      )}
      
      {canManage && feedback.status === "approved" && (
        <FeedbackActions
          feedbackId={feedback.id}
          actions={["resolve"]}
        />
      )}
      
      {isAuthor && feedback.status === "pending" && (
        <div className="mt-3 flex gap-2">
          <EditFeedbackButton feedback={feedback} />
          <DeleteFeedbackButton feedbackId={feedback.id} />
        </div>
      )}
    </div>
  );
};
```

**Files:**
- New: `src/components/sections/entry-feedback/entry-feedback-panel.tsx`
- New: `src/components/sections/entry-feedback/feedback-card.tsx`
- New: `src/components/sections/entry-feedback/feedback-form.tsx`
- New: `src/components/sections/entry-feedback/feedback-status-section.tsx`
- New: `src/components/sections/entry-feedback/feedback-actions.tsx`

---

### Phase 4: Integration (2-3 hours)
**Priority:** MEDIUM

#### Entry Page Integration

```typescript
// src/app/[entryId]/page.tsx

const EntryEditContent = async ({
  entry,
  obituaries,
  generatedImages,
  canEdit,
  role,
}: {...}) => {
  const entryDetails = await getEntryDetailsById(entry.id);
  const entryImagesResult = await getEntryImages(entry.id);
  // ... existing code ...
  
  return (
    <div className="space-y-8 loading-fade">
      {/* Existing sections */}
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Entry Details Card */}
          {/* Photos & Images Card */}
          
          {/* NEW: Entry Feedback Section */}
          <Suspense fallback={<FeedbackSkeleton />}>
            <EntryFeedbackPanel
              entryId={entry.id}
              canManage={canEdit}
            />
          </Suspense>
        </div>
        
        <div>
          {/* Obituaries & Images */}
        </div>
      </div>
    </div>
  );
};
```

**Files:**
- Update: `src/app/[entryId]/page.tsx`

---

### Phase 5: Polish & Testing (2-3 hours)
**Priority:** MEDIUM

- [ ] Add loading skeletons
- [ ] Add optimistic UI updates
- [ ] Add error handling and toasts
- [ ] Add empty states
- [ ] Add keyboard navigation
- [ ] Add accessibility (ARIA labels)
- [ ] Manual testing scenarios
- [ ] Update documentation

**Files:**
- New: `src/components/skeletons/feedback.tsx`
- Update: Documentation files

---

## Security Considerations

### Access Control
1. **View Feedback:** Must have entry access (owner or org member)
2. **Create Feedback:** Must have entry access
3. **Manage Status:** Must be entry creator
4. **Edit/Delete:** Must be feedback author (pending only)

### Data Validation
```typescript
// Content length limits
const MAX_FEEDBACK_LENGTH = 2000;

// Sanitize user input
import { sanitize } from "dompurify";

// Rate limiting (optional)
const MAX_FEEDBACK_PER_HOUR = 10;
```

### Database Security
```sql
-- Row-level security (if using Postgres RLS)
CREATE POLICY entry_feedback_select ON entry_feedback
  FOR SELECT
  USING (
    entry_id IN (
      SELECT id FROM entry 
      WHERE user_id = auth.uid() 
        OR organization_id = auth.organization_id()
    )
  );
```

---

## Edge Cases

### 1. User Leaves Organization
**Scenario:** User creates feedback, then leaves org

**Behavior:**
- Feedback remains visible to entry creator
- Feedback author loses access to entry
- Cannot edit/delete their own feedback
- Creator can still manage status

**Resolution:** Feedback is tied to entry, not org membership

### 2. Entry Creator Changes
**Scenario:** Entry ownership transferred (future feature)

**Behavior:**
- New owner inherits management rights
- Previous owner loses management rights
- All feedback history preserved

### 3. Concurrent Status Changes
**Scenario:** Two creators try to change status simultaneously

**Behavior:**
- Last write wins (timestamp-based)
- `statusChangedAt` and `statusChangedBy` track latest change

### 4. Feedback on Deleted Entry
**Scenario:** Entry is deleted

**Behavior:**
- Cascade delete: All feedback deleted with entry
- Foreign key constraint ensures data integrity

---

## Metrics & Analytics

### Success Metrics
- Number of feedback items per entry
- Time to resolution (created → resolved)
- Approval vs. denial rate
- Active collaborators per entry
- Feedback density by organization size

### Tracking Points
```typescript
// Analytics events
analytics.track("entry_feedback_created", {
  entryId,
  userId,
  organizationId,
});

analytics.track("entry_feedback_status_changed", {
  feedbackId,
  oldStatus,
  newStatus,
  timeToChange,
});
```

---

## Future Enhancements

### V2 Features (Not in Initial Release)

1. **Mentions & Notifications**
   - @mention specific org members
   - Email notifications for status changes
   - In-app notification center

2. **Threaded Replies**
   - Reply to feedback items
   - Nested conversation threads
   - Follow-up clarifications

3. **Rich Text Editor**
   - Markdown support
   - Inline images
   - Code snippets for data corrections

4. **Batch Operations**
   - Approve/deny multiple items
   - Bulk status changes
   - Filter and export feedback

5. **Feedback Templates**
   - Common correction types
   - Quick suggestions
   - Standardized format

6. **Priority Levels**
   - Critical/High/Medium/Low
   - Sort by priority
   - SLA tracking

7. **Integration with Entry History**
   - Link feedback to entry changes
   - Track which feedback led to edits
   - Audit trail

---

## Dependencies

### Technical
- ✅ Existing entry access control system
- ✅ Organization collaboration infrastructure
- ✅ Drizzle ORM
- ✅ Clerk authentication

### External
- None

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Confusion with obituary comments | Medium | Medium | Clear visual separation, different location, distinct labeling |
| Spam feedback | Medium | Low | Rate limiting, org-only access |
| Performance with many feedback items | Medium | Low | Pagination, collapsible sections, indexes |
| Status management complexity | Low | Low | Simple state machine, clear UI |

---

## Open Questions

1. **Q:** Should feedback be anonymous option?  
   **A:** No. Transparency is important for collaboration.

2. **Q:** Should we notify entry creator of new feedback?  
   **A:** Phase 2 feature. Start with in-app indicators.

3. **Q:** Can feedback author see denial reason?  
   **A:** No additional reason field in V1. Creator can reply via separate feedback.

4. **Q:** Should resolved feedback be deletable?  
   **A:** No. Preserve audit trail.

---

## Success Criteria

### Minimum Viable Product (MVP)
- [ ] Organization members can add feedback to entries
- [ ] Entry creators can approve/deny/resolve feedback
- [ ] Feedback displays with correct state indicators
- [ ] Clear visual separation from obituary comments
- [ ] Proper access control enforcement
- [ ] Mobile responsive design

### Definition of Done
- [ ] All database migrations applied
- [ ] All CRUD operations working
- [ ] State transitions functioning correctly
- [ ] UI matches design specifications
- [ ] Access control tests passing
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] No critical bugs

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Database | Schema, migrations, types | 2-3 hours |
| Phase 2: Backend | Queries, mutations, validation | 3-4 hours |
| Phase 3: Components | UI components, forms | 4-5 hours |
| Phase 4: Integration | Entry page integration | 2-3 hours |
| Phase 5: Polish | Testing, refinement | 2-3 hours |
| **Total** | | **13-18 hours** |

---

## Appendix

### Similar Features Reference
- GitHub Pull Request Reviews (approve/request changes)
- Google Docs Comments (resolve/reply)
- Figma Comments (resolve/delete)
- Notion Comments (open/resolved)

### Comparison with Obituary Comments
| Feature | Entry Feedback | Obituary Comments |
|---------|---------------|-------------------|
| **Purpose** | Fact-checking, corrections | Discussion, memories |
| **Location** | Entry page, below details | Obituary view page |
| **State Management** | Approve/Deny/Resolve | None |
| **Access** | Org members only | Configurable |
| **Management** | Entry creator | Obituary creator |

---

**Document Status:** ✅ Ready for Review  
**Next Steps:** Review with stakeholders, proceed to implementation if approved

