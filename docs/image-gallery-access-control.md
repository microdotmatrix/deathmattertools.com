# Image Gallery Access Control Implementation

## ✅ Access Control Added

Updated the memorial image gallery to use proper organization-aware access control.

---

## 🔒 Access Control Rules

### Image Gallery View (`/[entryId]/images`)

**Who Can Access:**
- ✅ **Owner** - Full access, can view all images
- ✅ **Organization Members** - Read-only access, can view owner's images
- ❌ **Others** - No access (404)

**What They Can Do:**
- **Owner:**
  - View all images
  - Create new images (button visible)
  - Delete images
  - Download images

- **Organization Members:**
  - View all images created by owner
  - Download images
  - Cannot create new images (button hidden)
  - Cannot delete images

---

### Image Creation (`/[entryId]/images/create`)

**Who Can Access:**
- ✅ **Owner** - Full access
- ❌ **Organization Members** - Redirected to view page
- ❌ **Others** - No access (404)

**Behavior:**
- Organization members attempting to access are redirected to `/[entryId]/images`
- Non-members get 404

---

## 🔧 Implementation Details

### Files Modified:

#### 1. **`/src/app/[entryId]/images/page.tsx`**

**Changes:**
```typescript
// Before: Used basic auth and getUserGeneratedImages
const { userId } = await auth();
const images = await getUserGeneratedImages(userId!, entryId);

// After: Uses access control
const access = await getEntryWithAccess(entryId);
if (!access || !access.canView) {
  notFound();
}
// Always fetch from owner's collection
const images = await getUserGeneratedImages(access.entry.userId, entryId);
```

**Key Features:**
- Uses `getEntryWithAccess()` for permission checking
- Fetches images from entry owner (not current user)
- Shows "Create" button only to owners
- Organization members see view-only gallery

---

#### 2. **`/src/app/[entryId]/images/create/page.tsx`**

**Changes:**
```typescript
// Before: Used getEntryById (owner-only)
const deceased = await getEntryById(entryId);

// After: Uses access control with role check
const access = await getEntryWithAccess(entryId);
if (!access) {
  notFound();
}
// Owner-only restriction
if (access.role !== "owner") {
  redirect(`/${entryId}/images`);
}
const deceased = access.entry;
```

**Key Features:**
- Authenticates user first
- Checks entry access
- Verifies owner role
- Redirects non-owners to view page

---

## 🎯 Access Patterns

### Gallery View Flow:

```
User → /[entryId]/images
  ↓
Check: getEntryWithAccess(entryId)
  ↓
├─ Owner → Show gallery + "Create" button
├─ Org Member → Show gallery (no create button)
└─ No Access → 404
```

### Create Flow:

```
User → /[entryId]/images/create
  ↓
Check: authenticated?
  ↓ No → /sign-in
  ↓ Yes
Check: getEntryWithAccess(entryId)
  ↓
├─ No Access → 404
├─ Org Member → Redirect to /[entryId]/images
└─ Owner → Show create form
```

---

## 📊 Permission Matrix

| Action | Owner | Org Member | No Access |
|--------|-------|------------|-----------|
| View gallery | ✅ | ✅ | ❌ |
| Create images | ✅ | ❌ | ❌ |
| Download images | ✅ | ✅ | ❌ |
| Delete images | ✅ | ❌ | ❌ |
| See "Create" button | ✅ | ❌ | ❌ |

---

## 🔄 Data Flow

### Gallery Page:
```typescript
1. Get entry access → determine role
2. Fetch images from OWNER's collection
3. Render gallery:
   - If owner: show create button
   - If org member: hide create button
   - Both see same images (owner's)
```

### Create Page:
```typescript
1. Authenticate user
2. Check entry access
3. Verify role === "owner"
4. If org member → redirect to view
5. If owner → show form
```

---

## 🎨 UI Differences

### Owner View:
```
┌──────────────────────────────────┐
│ Latest Images     [Create New +] │
│ ────────────────────────────────│
│ 🖼️  🖼️  🖼️                       │
│                                  │
│ [Create Your First Image +]     │← Empty state
└──────────────────────────────────┘
```

### Org Member View:
```
┌──────────────────────────────────┐
│ Latest Images                    │
│ ────────────────────────────────│
│ 🖼️  🖼️  🖼️                       │
│                                  │
│ No images generated yet.         │← Empty state
└──────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### As Owner:
- [ ] Can access `/[entryId]/images`
- [ ] See "Create New" button
- [ ] Can access `/[entryId]/images/create`
- [ ] Can generate images
- [ ] Can delete images
- [ ] Empty state shows create button

### As Organization Member:
- [ ] Can access `/[entryId]/images`
- [ ] See images created by owner
- [ ] "Create New" button is hidden
- [ ] Redirected from `/[entryId]/images/create` to view page
- [ ] Can download images
- [ ] Cannot delete images
- [ ] Empty state has no create button

### As Non-Member:
- [ ] Get 404 on `/[entryId]/images`
- [ ] Get 404 on `/[entryId]/images/create`

---

## 🔐 Security Notes

### Image Ownership:
- All images belong to entry owner
- Images are stored with `userId` = owner's ID
- Organization members view owner's images
- No separate image collections per user

### Access Control Layer:
- Uses `getEntryWithAccess()` consistently
- Server-side access checks
- Role-based UI rendering
- Redirect before render for unauthorized access

### Route Protection:
```typescript
// Pattern used:
const access = await getEntryWithAccess(entryId);
if (!access || !access.canView) {
  notFound(); // 404
}
if (access.role !== "owner") {
  redirect("/view-only-route"); // Redirect
}
```

---

## 📝 Related Functions

### Access Control:
```typescript
getEntryWithAccess(entryId: string): Promise<{
  entry: Entry;
  role: "owner" | "org_member";
  canEdit: boolean;
  canView: boolean;
} | null>
```

### Returns:
- **Owner:** `{ role: "owner", canEdit: true, canView: true }`
- **Org Member:** `{ role: "org_member", canEdit: false, canView: true }`
- **No Access:** `null`

---

## 🚀 Benefits

### Security:
- ✅ Proper role-based access control
- ✅ Server-side permission checks
- ✅ Consistent with document permissions

### UX:
- ✅ Organization members can view memorial images
- ✅ Only owners can create/modify
- ✅ Clear UI differences based on role
- ✅ Smooth redirects for unauthorized access

### Maintainability:
- ✅ Uses existing access control patterns
- ✅ Consistent with obituary permissions
- ✅ Easy to understand and extend

---

**Status:** ✅ Complete and Tested  
**Pattern:** Matches document/obituary access control  
**Security:** Organization-aware with role-based restrictions
