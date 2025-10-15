# Dashboard Entry Card Access Control

## ✅ Action Buttons Restricted to Entry Owners

Updated the dashboard to hide action buttons from organization members, showing them only to entry creators.

---

## 🔒 Access Control Rules

### Entry Owners (Creators)
**Can see:**
- ✅ Edit button
- ✅ New Obituary button
- ✅ New Memorial Image button
- ✅ Delete button

### Organization Members (Team Members)
**Can see:**
- ✅ View Entry button only
- ❌ No edit/create/delete actions

---

## 🎯 What Changed

### Featured Entry Card

**Before:**
```typescript
<ActionButtons entry={entry} />
// Shown to everyone
```

**After:**
```typescript
{isOwnEntry ? (
  <ActionButtons entry={entry} />
) : (
  <Link href={`/${entry.id}`}>
    <Icon icon="mdi:eye" /> View Entry
  </Link>
)}
```

---

## 🎨 UI Differences

### Owner View:
```
┌─────────────────────────────────────┐
│ Featured Entry Image                │
│                                     │
│ John Doe                            │
│ Born: Jan 1, 1950                   │
│ Died: Dec 31, 2024                  │
│                                     │
│ [Edit] [New Obituary] [New Image]  │
│ [Delete]                            │
└─────────────────────────────────────┘
```

### Org Member View:
```
┌─────────────────────────────────────┐
│ Featured Entry Image  [Team Badge]  │
│                                     │
│ John Doe                            │
│ Born: Jan 1, 1950                   │
│ Died: Dec 31, 2024                  │
│                                     │
│ [👁 View Entry]                     │
└─────────────────────────────────────┘
```

---

## 📊 Button Visibility Matrix

| Button | Owner | Org Member |
|--------|-------|------------|
| **Edit** | ✅ | ❌ |
| **New Obituary** | ✅ | ❌ |
| **New Memorial Image** | ✅ | ❌ |
| **Delete** | ✅ | ❌ |
| **View Entry** | ✅ (in list) | ✅ (featured) |

---

## 🔄 Card Types

### 1. Featured Entry Card (Top)
- Shows most recent entry
- Large display with image
- **Conditional buttons:**
  - Owner: Full action buttons
  - Org Member: "View Entry" only
- Team badge for non-owned entries

### 2. Previous Entry Cards (List)
- Smaller cards in tabs
- Already had correct logic
- **Shows:**
  - Owner: Action buttons
  - Org Member: "View Entry" button

---

## 🎯 Implementation

### Key Logic:
```typescript
const { userId } = await auth();
const isOwnEntry = entry.userId === userId;

// In component:
{isOwnEntry ? (
  <ActionButtons entry={entry} />
) : (
  <Link href={`/${entry.id}`}>View Entry</Link>
)}
```

### Consistency:
- ✅ Featured card now matches list cards
- ✅ Both check `isOwnEntry`
- ✅ Both show team badge for shared entries
- ✅ Both provide appropriate actions

---

## 🏷️ Visual Indicators

### Team Badge:
```typescript
{!isOwnEntry && (
  <Badge variant="secondary">
    <Icon icon="mdi:account-group" />
    Team Entry
  </Badge>
)}
```

**Shows:**
- In featured card header
- In previous entry cards
- With tooltip explaining it's from org member

---

## 🧪 Testing Checklist

### As Entry Owner:
- [ ] See all action buttons on featured card
- [ ] Can edit entry
- [ ] Can create new obituary
- [ ] Can create new memorial image
- [ ] Can delete entry
- [ ] No team badge shown

### As Organization Member:
- [ ] See "View Entry" button only
- [ ] No edit button visible
- [ ] No create buttons visible
- [ ] No delete button visible
- [ ] Team badge is shown
- [ ] Can still navigate to entry detail page

---

## 🔐 Security Notes

### UI-Level Restriction:
- This hides buttons from org members
- **Does NOT prevent** direct URL access
- Server-side protection still required

### Recommendation:
Routes should also check ownership:
```typescript
// Example in edit page
const access = await getEntryWithAccess(entryId);
if (access.role !== "owner") {
  redirect(`/${entryId}`);
}
```

---

## 📝 Related Access Control

### Consistent with:
- ✅ Obituary access control (owners edit, members view)
- ✅ Image gallery (owners create, members view)
- ✅ Document permissions (owners edit, members comment)

### Pattern:
```typescript
Owner → Full CRUD access
Org Member → Read-only access
Non-member → No access (404)
```

---

## 🎨 Benefits

### User Experience:
- ✅ Clear visual distinction
- ✅ Prevents confusion
- ✅ Appropriate actions per role
- ✅ Team badge shows collaboration

### Security:
- ✅ Hides privileged actions
- ✅ Guides users to correct workflow
- ✅ Reduces accidental edits
- ✅ Encourages proper access patterns

---

## 🚀 Summary

**Dashboard entry cards now properly restrict action buttons:**
- **Owners** see full action buttons (Edit, Create, Delete)
- **Org Members** see "View Entry" button only
- **Team badges** indicate shared entries
- **Consistent** with other access control patterns

This ensures organization members can view and collaborate on entries without accidentally editing or deleting content created by others.

---

**Status:** ✅ Complete  
**Pattern:** Owner-only actions, read-only for team members  
**Consistency:** Matches document/obituary/image permissions
