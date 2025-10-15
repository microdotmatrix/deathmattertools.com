# Entry Feedback System - Quick Reference

## 📋 Overview

Add a feedback/collaboration system at the entry level (separate from obituary comments) enabling organization members to provide feedback on entry details with state management by the entry creator.

---

## 🎯 Key Features

### What's New
1. **Entry-level comments** - Separate from obituary comments
2. **State management** - Approve/Deny/Resolve workflow
3. **Organization collaboration** - Team members can provide feedback
4. **Audit trail** - Track all feedback and state changes

### Visual Location
```
Entry Page
├── Entry Details
├── Obituary Details  
├── Photos & Images
└── 💬 Entry Feedback Section (NEW)
    ├── Pending (badge count)
    ├── Approved (badge count)
    ├── Resolved (badge count)
    └── Denied (badge count)
```

---

## 🗄️ Database Schema

### New Table: `entry_feedback`

```sql
CREATE TABLE entry_feedback (
  id UUID PRIMARY KEY,
  entry_id TEXT REFERENCES entry(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES user(id),
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending|approved|denied|resolved
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  status_changed_at TIMESTAMP,
  status_changed_by TEXT REFERENCES user(id)
);

CREATE INDEX entry_feedback_entry_id_idx ON entry_feedback(entry_id);
CREATE INDEX entry_feedback_status_idx ON entry_feedback(status);
```

---

## 🔄 State Machine

```
Pending (default)
  ├─→ Approved (creator agrees)
  │     └─→ Resolved (creator fixed it)
  └─→ Denied (creator disagrees)
```

**Rules:**
- Only entry creator can change status
- Authors can edit/delete pending feedback
- Resolved/denied feedback is read-only

---

## 🔒 Permissions

| Action | Creator | Org Member | Other |
|--------|---------|------------|-------|
| View | ✅ | ✅ | ❌ |
| Add Feedback | ✅ | ✅ | ❌ |
| Edit Own (pending) | ✅ | ✅ | ❌ |
| Delete Own (pending) | ✅ | ✅ | ❌ |
| Approve/Deny | ✅ | ❌ | ❌ |
| Resolve | ✅ | ❌ | ❌ |

---

## 🎨 UI Components

### Feedback Card States

**🕐 Pending** (Amber border)
```
┌──────────────────────────────┐
│ 🕐 Pending                   │
│ John Doe · 2h ago            │
│ "Birth date seems wrong..."  │
│                              │
│ [✓ Approve] [✗ Deny]        │
│ [Edit] [Delete]              │
└──────────────────────────────┘
```

**✅ Approved** (Green border)
```
┌──────────────────────────────┐
│ ✅ Approved                  │
│ John Doe · 2h ago            │
│ "Birth date seems wrong..."  │
│                              │
│ [✓ Mark as Resolved]        │
└──────────────────────────────┘
```

**✓ Resolved** (Muted/gray)
```
┌──────────────────────────────┐
│ ✓ Resolved                   │
│ John Doe · 3d ago            │
│ "Birth date seems wrong..."  │
└──────────────────────────────┘
```

**❌ Denied** (Red border)
```
┌──────────────────────────────┐
│ ❌ Denied                    │
│ John Doe · 2h ago            │
│ "Incorrect info..."          │
└──────────────────────────────┘
```

---

## 📂 Files to Create/Modify

### New Files (8)
```
Database:
✅ src/lib/db/schema/entry-feedback.ts
✅ drizzle/migrations/XXXX_entry_feedback.sql

Queries/Mutations:
✅ src/lib/db/queries/entry-feedback.ts
✅ src/lib/db/mutations/entry-feedback.ts

Components:
✅ src/components/sections/entry-feedback/entry-feedback-panel.tsx
✅ src/components/sections/entry-feedback/feedback-card.tsx
✅ src/components/sections/entry-feedback/feedback-form.tsx
✅ src/components/sections/entry-feedback/feedback-status-section.tsx
✅ src/components/sections/entry-feedback/feedback-actions.tsx

Skeletons:
✅ src/components/skeletons/feedback.tsx
```

### Modified Files (2)
```
✅ src/app/[entryId]/page.tsx (add feedback panel)
✅ src/lib/db/schema/index.ts (export new schema)
```

---

## 🏗️ Implementation Phases

### Phase 1: Database (2-3 hrs) 🔴 Critical
- Create schema and types
- Generate migration
- Add indexes

### Phase 2: Backend (3-4 hrs) 🔴 Critical
- Query functions
- Mutation actions
- Access control

### Phase 3: UI Components (4-5 hrs) 🔴 Critical
- Feedback panel
- Status sections
- Action buttons
- Forms

### Phase 4: Integration (2-3 hrs) 🟡 Medium
- Entry page integration
- Suspense boundaries
- Loading states

### Phase 5: Polish (2-3 hrs) 🟡 Medium
- Error handling
- Empty states
- Accessibility
- Testing

**Total:** 13-18 hours

---

## 🔍 Key Differences from Obituary Comments

| Feature | Entry Feedback | Obituary Comments |
|---------|---------------|-------------------|
| **Purpose** | Corrections, fact-checking | Memories, discussion |
| **Location** | Entry page (below cards) | Obituary view page |
| **States** | Approve/Deny/Resolve | None |
| **Who Can Comment** | Org members only | Configurable |
| **Management** | Entry creator | Obituary creator |

---

## ✅ Success Criteria

**MVP Checklist:**
- [ ] Org members can add feedback
- [ ] Creators can approve/deny/resolve
- [ ] Correct state indicators
- [ ] Clear separation from obituary comments
- [ ] Access control working
- [ ] Mobile responsive

---

## 🧪 Testing Scenarios

### Scenario 1: Add Feedback
```
1. User B (org member) views User A's entry
2. Sees "Entry Feedback" section
3. Adds feedback: "Birth date should be 1985"
4. Feedback appears in "Pending" section
```

### Scenario 2: Approve Feedback
```
1. User A (creator) views their entry
2. Sees feedback in "Pending (1)"
3. Clicks "Approve"
4. Feedback moves to "Approved" section
5. Can now click "Mark as Resolved"
```

### Scenario 3: Deny Feedback
```
1. User A (creator) views feedback
2. Clicks "Deny"
3. Feedback moves to "Denied" section
4. Becomes read-only
```

### Scenario 4: Edit Own Feedback
```
1. User B sees their pending feedback
2. Clicks "Edit"
3. Updates content
4. Saves changes
5. Only works for pending feedback
```

---

## 🚨 Security

### Access Control
```typescript
// Only org members with entry access
const access = await getEntryWithAccess(entryId);
if (!access || !access.canView) {
  return { error: "Forbidden" };
}

// Only creator can manage status
if (entry.userId !== userId) {
  return { error: "Only creator can manage feedback" };
}

// Only author can edit/delete pending
if (feedback.userId !== userId && feedback.status === "pending") {
  return { error: "Can only edit your own pending feedback" };
}
```

---

## 📊 Example Use Cases

### Use Case 1: Fact Correction
```
Feedback: "Date of death is incorrect, should be June 15, 2024"
Creator: Approves → Updates entry → Marks as Resolved
```

### Use Case 2: Location Clarification
```
Feedback: "Born in Chicago, IL not Chicago Heights"
Creator: Approves → Updates entry → Resolves
```

### Use Case 3: Invalid Suggestion
```
Feedback: "Wrong person entirely"
Creator: Denies (feedback is marked denied, read-only)
```

---

## 🎯 Next Steps

1. **Review PRD** - Team approval
2. **Phase 1** - Database setup
3. **Phase 2** - Backend logic
4. **Phase 3** - UI components
5. **Phase 4** - Integration
6. **Phase 5** - Testing & polish

---

**Status:** 📝 Planning  
**Estimated Time:** 13-18 hours  
**Dependencies:** Organization collaboration feature ✅
