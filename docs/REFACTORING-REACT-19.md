# React 19.2 Refactoring: useTransition Best Practices

**Date:** January 17, 2025  
**Commit:** `83da291`  
**Files Changed:** 3 components  
**Net Change:** -5 lines (69 insertions, 74 deletions)

---

## Overview

Refactored quote components to follow React 19.2 best practices by replacing manual `useState` for pending states with `useTransition`. This improves progressive enhancement, reduces state management complexity, and aligns with modern React patterns.

---

## React 19.2 Patterns Applied

### Key Concept: Transitions for Async Actions

React 19.2's `useTransition` hook allows async functions (Actions) to be wrapped in transitions, automatically managing pending states and ensuring responsive UI during async operations.

**Benefits:**
- ✅ Automatic pending state management
- ✅ UI remains responsive during async operations
- ✅ Reduces boilerplate code
- ✅ Better progressive enhancement
- ✅ Follows React's concurrent rendering model

---

## Changes Made

### 1. SearchResultCard - Save Quote Action

**Before (Manual State Management):**
```typescript
const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);

const handleSave = async () => {
  setSaving(true);
  
  const formData = new FormData();
  // ... build formData
  
  const response = await saveQuoteAction({} as any, formData);
  
  setSaving(false);
  
  if (response.error) {
    toast.error(response.error);
  } else {
    setSaved(true);
    toast.success("Saved successfully!");
  }
};

// In render:
<Button 
  onClick={handleSave} 
  disabled={saving || saved}
>
  {saving ? "Saving..." : "Save"}
</Button>
```

**After (useTransition):**
```typescript
const [isPending, startTransition] = useTransition();
const [saved, setSaved] = useState(false);

const handleSave = () => {
  startTransition(async () => {
    const formData = new FormData();
    // ... build formData
    
    const response = await saveQuoteAction({} as any, formData);
    
    if (response.error) {
      toast.error(response.error);
    } else {
      setSaved(true);
      toast.success("Saved successfully!");
    }
  });
};

// In render:
<Button 
  onClick={handleSave} 
  disabled={isPending || saved}
>
  {isPending ? "Saving..." : "Save"}
</Button>
```

**Improvements:**
- ❌ Removed: Manual `saving` state and `setSaving` calls
- ✅ Added: `useTransition` hook for automatic pending state
- ✅ Reduced: 2 state variables to 1 + transition
- ✅ Simplified: No more manual state toggling

---

### 2. SavedQuoteCard - Delete Quote Action

**Before (Manual State Management):**
```typescript
const [deleting, setDeleting] = useState(false);

const handleDelete = async () => {
  setDeleting(true);
  
  const response = await deleteQuoteAction(quote.id, quote.entryId);
  
  if (response.error) {
    toast.error(response.error);
    setDeleting(false);
  } else {
    toast.success("Quote deleted successfully");
  }
  
  setShowDeleteDialog(false);
};

// In render:
<Button disabled={deleting}>
  {deleting ? "Deleting..." : "Delete"}
</Button>
```

**After (useTransition):**
```typescript
const [isPending, startTransition] = useTransition();

const handleDelete = () => {
  startTransition(async () => {
    const response = await deleteQuoteAction(quote.id, quote.entryId);
    
    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success("Quote deleted successfully");
      setShowDeleteDialog(false);
    }
  });
};

// In render:
<Button disabled={isPending}>
  {isPending ? "Deleting..." : "Delete"}
</Button>
```

**Improvements:**
- ❌ Removed: `deleting` state and manual state management
- ✅ Added: `useTransition` for automatic pending state
- ✅ Cleaner: Error handling doesn't need to reset state
- ✅ Bonus: Dialog close now only happens on success

---

### 3. SearchDialog - Search Action

**Before (Manual State Management):**
```typescript
const [loading, setLoading] = useState(false);

const handleSearch = async (params: SearchParams) => {
  setLoading(true);
  setHasSearched(true);
  
  try {
    const searchResults = await searchContent(params);
    setResults(searchResults);
    
    if (searchResults.length === 0) {
      toast.info("No results found");
    }
  } catch (error) {
    console.error("Search failed:", error);
    toast.error("Search failed. Please try again.");
    setResults([]);
  } finally {
    setLoading(false);
  }
};

// In render:
<SearchForm loading={loading} />
<SearchResults loading={loading} />
```

**After (useTransition):**
```typescript
const [isPending, startTransition] = useTransition();

const handleSearch = (params: SearchParams) => {
  setHasSearched(true);
  
  startTransition(async () => {
    try {
      const searchResults = await searchContent(params);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        toast.info("No results found");
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed. Please try again.");
      setResults([]);
    }
  });
};

// In render:
<SearchForm loading={isPending} />
<SearchResults loading={isPending} />
```

**Improvements:**
- ❌ Removed: `loading` state and `finally` block
- ✅ Added: `useTransition` for automatic pending state
- ✅ Cleaner: No need for try/finally pattern
- ✅ Simpler: Function is no longer async (returns void)

---

## Key Takeaways

### When to Use useTransition

✅ **Use `useTransition` for:**
- Server action calls
- Async data fetching
- Any async operation that should show pending UI
- Actions triggered by user interactions (clicks, form submissions)

❌ **Don't use `useTransition` for:**
- Synchronous operations
- Operations that need immediate feedback (use `useOptimistic` instead)
- Initial data loading (use Suspense boundaries)

### Pattern Summary

**Old Pattern:**
```typescript
const [pending, setPending] = useState(false);

const action = async () => {
  setPending(true);
  try {
    await serverAction();
  } finally {
    setPending(false);
  }
};
```

**New Pattern:**
```typescript
const [isPending, startTransition] = useTransition();

const action = () => {
  startTransition(async () => {
    await serverAction();
  });
};
```

---

## Performance Benefits

### Before Refactoring
- Manual state updates trigger re-renders
- Multiple useState calls create multiple state variables
- Finally blocks add complexity
- Easy to forget to reset state on errors

### After Refactoring
- Transition handles pending state automatically
- Single source of truth for pending status
- No finally blocks needed
- State resets automatically when transition completes
- UI remains responsive during async operations

---

## Code Metrics

### Lines of Code Reduction
```
Before: 74 lines (3 components)
After:  69 lines (3 components)
Reduction: 5 lines (6.8% reduction)
```

### State Variables Reduced
```
SearchResultCard:  2 → 1 + transition (-1 state)
SavedQuoteCard:    2 → 1 + transition (-1 state)
SearchDialog:      3 → 2 + transition (-1 state)
Total Reduction: 3 useState calls eliminated
```

---

## Testing Considerations

### What to Test

1. **Pending State Behavior**
   - Buttons disable during transitions
   - Loading indicators show correctly
   - UI remains responsive

2. **Error Handling**
   - Toast messages still appear
   - State resets properly on errors
   - Dialog closes only on success

3. **Success Path**
   - Actions complete successfully
   - UI updates after transition
   - Revalidation triggers correctly

### Manual Test Checklist
- [ ] Save quote shows "Saving..." during transition
- [ ] Delete quote shows "Deleting..." during transition
- [ ] Search shows loading state during transition
- [ ] Multiple rapid clicks don't cause issues
- [ ] Error toasts still appear
- [ ] Success toasts still appear
- [ ] Page revalidates after mutations

---

## Additional Resources

### React 19.2 Documentation
- [useTransition Hook](https://react.dev/reference/react/useTransition)
- [Actions and Transitions](https://react.dev/reference/react/useTransition#usage)
- [Server Actions with Transitions](https://react.dev/reference/rsc/server-actions)

### Related Patterns
- **useActionState**: For form submissions with state
- **useOptimistic**: For optimistic UI updates
- **useFormStatus**: For accessing form pending status

---

## Future Improvements

### Potential Next Steps

1. **Convert to Form Actions**
   - SearchResultCard could use a form with action prop
   - Would eliminate onClick handler entirely
   - Better progressive enhancement

2. **Add Optimistic Updates**
   - Use `useOptimistic` for immediate UI feedback
   - Show deleted quotes gray out instantly
   - Show saved quotes appear immediately

3. **Implement useActionState**
   - For forms with complex validation
   - Better error state management
   - Built-in pending state

### Example: Form Action Pattern
```typescript
// Future enhancement
<form action={saveQuoteAction}>
  <input type="hidden" name="entryId" value={entryId} />
  <input type="hidden" name="quote" value={result.content} />
  <Button type="submit">Save</Button>
</form>
```

---

## Summary

This refactoring brings the quote components in line with React 19.2 best practices:

✅ **Eliminated** 3 manual useState calls for pending states  
✅ **Simplified** async action handling  
✅ **Improved** code readability and maintainability  
✅ **Enhanced** progressive enhancement capabilities  
✅ **Reduced** boilerplate code by 6.8%  

The components now leverage React's built-in transition system for managing async operations, resulting in cleaner, more maintainable code that follows modern React patterns.
