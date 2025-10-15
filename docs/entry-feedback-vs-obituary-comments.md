# Entry Feedback vs Obituary Comments: Comparison

## 🎯 Purpose & Intent

### Entry Feedback (NEW)
**Purpose:** Collaborative fact-checking and quality improvement  
**Intent:** Help entry creators identify and fix errors in biographical data  
**Tone:** Constructive criticism, data correction

**Example Comments:**
- "Birth date should be 1985, not 1986"
- "Location died is incorrect - should be Chicago, IL"
- "Cause of death field has a typo"
- "Middle name is missing"

### Obituary Comments (EXISTING)
**Purpose:** Community remembrance and sharing  
**Intent:** Express condolences, share memories, discuss content  
**Tone:** Respectful, memorial, conversational

**Example Comments:**
- "Beautiful tribute to a wonderful person"
- "I remember when we worked together..."
- "Sending prayers to the family"
- "This captures his spirit perfectly"

---

## 📍 Location in Application

### Entry Feedback
```
Entry Page (/[entryId])
├── Header & Navigation
├── Entry Edit Form (2/3 width)
│   ├── Basic Information
│   └── Entry Image Upload
├── Entry Details Cards (2/3 width)
│   ├── Obituary Details
│   └── Photos & Images
└── 💬 Entry Feedback Panel (2/3 width) ← NEW
    └── Below all entry-related cards
```

### Obituary Comments  
```
Obituary View Page (/[entryId]/obituaries/[id]/view)
├── Header
├── Obituary Content (full width)
├── Commenting Settings Toggle
└── 💬 Comments Panel (full width)
    └── At bottom of obituary
```

**Key Difference:** Different pages, different contexts

---

## 👥 Who Can Participate?

### Entry Feedback
| User Type | Can View | Can Comment | Can Manage |
|-----------|----------|-------------|------------|
| Entry Creator | ✅ | ✅ | ✅ |
| Org Member | ✅ | ✅ | ❌ |
| Non-Org User | ❌ | ❌ | ❌ |

**Restriction:** Organization-only, always enabled

### Obituary Comments
| User Type | Can View | Can Comment | Can Manage |
|-----------|----------|-------------|------------|
| Obituary Creator | ✅ | ✅ | ✅ |
| Org Member | ✅ | ✅* | ❌ |
| Non-Org User | ❌ | ❌ | ❌ |

**Restriction:** Configurable via `organizationCommentingEnabled`  
*Only when explicitly enabled by creator

---

## 🔄 Workflow & State Management

### Entry Feedback Workflow
```
User submits feedback
       ↓
┌──────────────┐
│   PENDING    │ ← Default state
└──────┬───────┘
       │
       ├─────────────────┐
       ↓                 ↓
┌──────────────┐  ┌─────────────┐
│   APPROVED   │  │   DENIED    │
└──────┬───────┘  └─────────────┘
       │               │
       ↓               ↓
┌──────────────┐  (Read-only)
│   RESOLVED   │
└──────────────┘
```

**States:** 4 (Pending, Approved, Denied, Resolved)  
**Manager:** Entry creator only  
**Purpose:** Track correction workflow

### Obituary Comments Workflow
```
User submits comment
       ↓
┌──────────────┐
│   POSTED     │ ← Only state
└──────────────┘
       │
       ├─────────────────┐
       ↓                 ↓
   (Edit)          (Delete)
```

**States:** 1 (Posted)  
**Manager:** Comment author + obituary creator  
**Purpose:** Simple discussion thread

---

## 🗄️ Database Schema Comparison

### Entry Feedback Schema
```typescript
{
  id: uuid,
  entryId: text,           // Links to entry
  userId: text,            // Who created feedback
  content: text,
  status: enum,            // ← State management
  statusChangedAt: timestamp,
  statusChangedBy: text,   // ← Audit trail
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

### Obituary Comment Schema
```typescript
{
  id: uuid,
  documentId: uuid,        // Links to obituary
  userId: text,
  content: text,
  parentId: uuid?,         // ← Threading support
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

**Key Difference:** Entry feedback has state management fields

---

## 🎨 UI/UX Differences

### Entry Feedback UI

**Organized by Status:**
```
┌─────────────────────────────────────┐
│ 💬 Entry Feedback & Collaboration  │
├─────────────────────────────────────┤
│ [Add Feedback Button]               │
│                                     │
│ 🕐 Pending Review (2)              │
│ ├─ Feedback 1 [Approve] [Deny]    │
│ └─ Feedback 2 [Approve] [Deny]    │
│                                     │
│ ✅ Approved (1)                    │
│ └─ Feedback 3 [Resolve]           │
│                                     │
│ ✓ Resolved (3) [Collapsed]         │
│ ❌ Denied (1) [Collapsed]          │
└─────────────────────────────────────┘
```

**Features:**
- Collapsible sections by status
- Badge counts
- Color-coded states
- Management buttons

### Obituary Comments UI

**Linear Thread:**
```
┌─────────────────────────────────────┐
│ 💬 Comments                         │
├─────────────────────────────────────┤
│ [Enable Org Commenting Toggle]     │
│                                     │
│ John · 2h ago                       │
│ "Beautiful obituary..."             │
│ [Reply] [Edit] [Delete]             │
│                                     │
│ Jane · 1d ago                       │
│ "Wonderful memories..."             │
│ [Reply]                             │
│                                     │
│ [Add Comment]                       │
└─────────────────────────────────────┘
```

**Features:**
- Simple chronological list
- Reply threading (via parentId)
- No status management
- No categorization

---

## ⚙️ Management & Permissions

### Entry Feedback Management

**Creator Can:**
- ✅ Approve feedback (moves to approved)
- ✅ Deny feedback (moves to denied)
- ✅ Resolve approved feedback (final state)
- ✅ View all feedback
- ✅ Add their own feedback

**Org Member Can:**
- ✅ Add feedback
- ✅ Edit own pending feedback
- ✅ Delete own pending feedback
- ✅ View all feedback
- ❌ Change status
- ❌ Edit others' feedback

### Obituary Comment Management

**Creator Can:**
- ✅ Enable/disable org commenting
- ✅ Delete any comment
- ✅ Edit own comments
- ✅ Reply to comments

**Org Member Can:**
- ✅ Add comments (if enabled)
- ✅ Edit own comments
- ✅ Delete own comments
- ✅ Reply to comments
- ❌ Manage settings
- ❌ Delete others' comments

---

## 🔒 Access Control Logic

### Entry Feedback Access
```typescript
// Can view/comment if has entry access
const access = await getEntryWithAccess(entryId);
if (!access || !access.canView) {
  return null; // 404
}

// Can manage if is entry creator
const canManage = access.canEdit; // true for owner only
```

### Obituary Comment Access
```typescript
// Can view if has document access
const access = await getDocumentWithAccess(documentId, userId, orgId);
if (!access) {
  return null; // 404
}

// Can comment if enabled
const canComment = access.canComment; // Based on org settings
```

---

## 📊 Use Case Examples

### Entry Feedback Use Cases

1. **Data Correction**
   ```
   Feedback: "Date of birth is 1985-03-15, not 1986"
   Action: Creator approves → updates entry → resolves
   ```

2. **Missing Information**
   ```
   Feedback: "Middle name 'James' is missing"
   Action: Creator approves → adds middle name → resolves
   ```

3. **Invalid Suggestion**
   ```
   Feedback: "This is the wrong person"
   Action: Creator denies → feedback marked denied
   ```

### Obituary Comment Use Cases

1. **Condolence**
   ```
   Comment: "Sending love and prayers to the family"
   Action: Posted → stays as discussion
   ```

2. **Memory Sharing**
   ```
   Comment: "I remember when he taught me to fish..."
   Reply: "That's a beautiful memory"
   Action: Threaded conversation
   ```

3. **Content Feedback**
   ```
   Comment: "This captures his spirit perfectly"
   Action: Posted → creator can see appreciation
   ```

---

## 🎯 When to Use Which?

### Use Entry Feedback When:
- ✅ Correcting biographical data
- ✅ Suggesting information additions
- ✅ Flagging typos or errors
- ✅ Quality improvement
- ✅ Fact-checking

### Use Obituary Comments When:
- ✅ Sharing memories
- ✅ Expressing condolences
- ✅ Discussing obituary content
- ✅ Community engagement
- ✅ Memorial conversation

---

## 🔮 Future Considerations

### Entry Feedback Evolution
- Link feedback to actual entry edits
- Show "Fixed" indicator on resolved items
- Export correction history
- Feedback analytics dashboard

### Obituary Comments Evolution
- Rich media in comments (photos)
- Better threading UI
- Emoji reactions
- Comment moderation tools

---

## 📏 Technical Comparison

| Aspect | Entry Feedback | Obituary Comments |
|--------|---------------|-------------------|
| **Table** | `entry_feedback` | `document_comment` |
| **Parent** | `entry` | `document` (obituary) |
| **States** | 4 states | 1 state |
| **Threading** | No | Yes (via `parentId`) |
| **Audit Trail** | Yes (status changes) | Basic (created/updated) |
| **Access Toggle** | Always on (org only) | Configurable |
| **Manager** | Entry creator | Obituary creator |

---

## 🎨 Visual Separation

### Page Layout Context

```
Entry Page Layout:
┌──────────────────────────────────────────────┐
│ [Entry Header]                               │
├──────────────────────────────────────────────┤
│ Left Column (2/3)      Right Column (1/3)    │
│ ┌────────────────┐    ┌──────────────────┐  │
│ │ Entry Form     │    │ Obituaries List  │  │
│ └────────────────┘    │                  │  │
│ ┌────────────────┐    │                  │  │
│ │ Entry Details  │    │                  │  │
│ └────────────────┘    │                  │  │
│ ┌────────────────┐    └──────────────────┘  │
│ │ Photos/Images  │                           │
│ └────────────────┘                           │
│ ┌────────────────┐ ← Entry Feedback (NEW)   │
│ │ 💬 Feedback    │                           │
│ └────────────────┘                           │
└──────────────────────────────────────────────┘

Obituary View Page Layout:
┌──────────────────────────────────────────────┐
│ [Obituary Header]                            │
├──────────────────────────────────────────────┤
│ Full Width Content                           │
│ ┌──────────────────────────────────────────┐ │
│ │ Obituary Text                            │ │
│ │                                          │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ 💬 Comments (Existing)                   │ │
│ │                                          │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## ✅ Summary

| Aspect | Entry Feedback | Obituary Comments |
|--------|---------------|-------------------|
| **What** | Data corrections | Condolences & memories |
| **Where** | Entry page | Obituary page |
| **Who** | Org members only | Org (if enabled) |
| **How** | Approve/Deny/Resolve | Post/Reply/Delete |
| **Why** | Quality control | Community engagement |

**Bottom Line:** Two completely separate systems serving different purposes in different contexts.

