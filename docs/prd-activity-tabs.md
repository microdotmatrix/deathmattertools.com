# PRD: DirectionAwareTabs with React 19.2 Activity Component

## Overview

Update the `DirectionAwareTabs` component to leverage React 19.2's new `<Activity>` component for state preservation between tab transitions. This enhancement will preserve internal state (form inputs, scroll positions, expanded sections) when users switch between tabs, eliminating the current behavior where tab content is unmounted and state is lost.

## Current Implementation Analysis

### Component Location
`src/components/elements/animated-tabs.tsx`

### Current Behavior
The existing `DirectionAwareTabs` component uses `AnimatePresence` with `mode="popLayout"` to animate between tabs. When a tab changes:
1. The previous tab content is **unmounted** via `AnimatePresence`
2. The new tab content is **mounted** fresh
3. All internal state (form inputs, scroll position, expanded sections) is **lost**

### Current Usage Locations
| File | Use Case | State Loss Impact |
|------|----------|-------------------|
| `search-dialog.tsx` | Quotes/Scripture search tabs | Search results and form state reset on tab switch |
| `generate.tsx` | Create/Upload obituary tabs | Form inputs, file selections lost on tab switch |

### Current Code Structure
```tsx
<AnimatePresence custom={direction} mode="popLayout" onExitComplete={() => setIsAnimating(false)}>
  <motion.div key={activeTab} variants={variants} ...>
    {content}  // Content is unmounted/remounted on tab change
  </motion.div>
</AnimatePresence>
```

## Proposed Solution

### React 19.2 Activity Component

The `<Activity>` component (stable in React 19.2.0) provides a mechanism to hide UI while preserving state:

```tsx
import { Activity } from 'react';

<Activity mode={isActive ? 'visible' : 'hidden'}>
  <TabContent />
</Activity>
```

**Key Features:**
- **State Preservation**: Internal component state is maintained when hidden
- **DOM Preservation**: Uses `display: none` to hide content, preserving DOM state (textarea values, scroll positions)
- **Effect Management**: Effects are destroyed when hidden and re-created when visible
- **Lower Priority Rendering**: Hidden content re-renders at lower priority

### Architecture Decision

**Option A: Activity-Only (No Animation)**
- Wrap each tab in `<Activity>`
- Simple implementation
- No exit/enter animations
- Instant tab switching

**Option B: Activity + ViewTransition Integration** ✅ Recommended
- Combine `<Activity>` with `<ViewTransition>` for animated transitions
- Activity triggers ViewTransition's `enter`/`exit` animations automatically
- Maintains current animation feel while preserving state

**Option C: Activity + Motion Animations**
- Keep Motion animations for visible transitions
- Use Activity for state preservation
- More complex implementation
- May have visual conflicts

### Recommended Implementation (Option B)

```tsx
import { Activity, useState } from 'react';
import { ViewTransition } from 'react';

function DirectionAwareTabs({ tabs, className, rounded, onChange }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Tab buttons remain the same */}
      <div className="flex space-x-1 ...">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => handleTabClick(tab.id)} ...>
            {/* Active indicator with layoutId animation */}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content area with Activity boundaries */}
      <div className="relative w-full">
        {tabs.map((tab) => (
          <Activity key={tab.id} mode={activeTab === tab.id ? 'visible' : 'hidden'}>
            <div className="p-1">
              {tab.content}
            </div>
          </Activity>
        ))}
      </div>
    </div>
  );
}
```

## Implementation Strategy

### Phase 1: Core Component Update (1-2 hours)

1. **Update imports**
   ```tsx
   import { Activity, ReactNode, useMemo, useState } from "react";
   ```

2. **Refactor content rendering**
   - Remove `AnimatePresence` wrapper for content
   - Render all tabs wrapped in `<Activity>` boundaries
   - Set `mode` based on `activeTab` state

3. **Preserve tab button animations**
   - Keep Motion's `layoutId="bubble"` for the active indicator
   - This provides visual feedback without affecting content state

### Phase 2: Animation Enhancement (Optional, 1-2 hours)

1. **Add ViewTransition support**
   - Wrap Activity boundaries in ViewTransition for enter/exit animations
   - Configure transition styles for smooth tab switching

2. **Alternative: CSS transitions**
   - Use CSS opacity/transform transitions on Activity children
   - Simpler than ViewTransition, good fallback

### Phase 3: Testing & Refinement (1 hour)

1. **Test state preservation**
   - Form inputs persist across tab switches
   - Scroll positions maintained
   - Expanded/collapsed sections preserved

2. **Test in usage locations**
   - `SearchDialog`: Verify search results and form state persist
   - `GenerateObituary`: Verify form inputs and file selections persist

3. **Performance verification**
   - Ensure hidden tabs don't cause unnecessary re-renders
   - Verify effect cleanup when tabs are hidden

## API Changes

### Current API (No Changes Required)
```tsx
type Tab = {
  id: number;
  label: string;
  content: ReactNode;
};

interface DirectionAwareTabsProps {
  tabs: Tab[];
  className?: string;
  rounded?: string;
  onChange?: (tabId: number) => void;
}
```

### New Optional Props (Future Enhancement)
```tsx
interface DirectionAwareTabsProps {
  tabs: Tab[];
  className?: string;
  rounded?: string;
  onChange?: (tabId: number) => void;
  preserveState?: boolean;  // Default: true, allows opting out
  animateTransitions?: boolean;  // Default: true
}
```

## Migration Considerations

### Breaking Changes
- **None expected** - The component API remains identical
- Consumers may notice state is now preserved (positive change)

### Behavioral Changes
- Tab content state persists between switches
- Hidden tabs remain in DOM (with `display: none`)
- Effects in hidden tabs are destroyed and re-created on visibility change

### Consumer Updates Required
The `SearchDialog` component currently resets state on tab change:
```tsx
const handleTabChange = () => {
  setResults([]);
  setHasSearched(false);
};
```
This behavior may need review - with Activity, the state would persist naturally. The explicit reset may still be desired for UX reasons.

## Technical Requirements

### Dependencies
- React 19.2.0 ✅ (already installed)
- No additional dependencies required

### Browser Support
- Activity uses `display: none` - universal browser support
- ViewTransition requires modern browsers (Chrome 111+, Safari 18+)
- Fallback: instant switching without animation

## Success Criteria

1. **State Preservation**: Form inputs, scroll positions, and component state persist across tab switches
2. **No Visual Regression**: Tab switching feels smooth and responsive
3. **Performance**: No measurable performance degradation
4. **Backward Compatibility**: Existing usage locations work without modification

## Estimated Timeline

| Phase | Task | Duration |
|-------|------|----------|
| 1 | Core Activity implementation | 1-2 hours |
| 2 | Animation enhancement (optional) | 1-2 hours |
| 3 | Testing & refinement | 1 hour |
| **Total** | | **3-5 hours** |

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hidden tabs cause performance issues | Medium | Activity renders hidden content at lower priority; monitor with DevTools |
| Animation conflicts with Activity | Low | Test thoroughly; can fall back to CSS transitions |
| Unexpected state persistence | Low | Document behavior change; add `preserveState` prop if needed |

## References

- [React Activity Documentation](https://react.dev/reference/react/Activity)
- [React 19.2 Release Notes](https://react.dev/blog)
- [Current Component](../src/components/elements/animated-tabs.tsx)

## Appendix: Code Diff Preview

```diff
// animated-tabs.tsx

-import { AnimatePresence, MotionConfig, motion } from "motion/react";
-import { ReactNode, useMemo, useState } from "react";
+import { MotionConfig, motion } from "motion/react";
+import { Activity, ReactNode, useState } from "react";
 import useMeasure from "react-use-measure";

 // ... (types remain the same)

 function DirectionAwareTabs({ tabs, className, rounded, onChange }: Props) {
   const [activeTab, setActiveTab] = useState(0);
-  const [direction, setDirection] = useState(0);
-  const [isAnimating, setIsAnimating] = useState(false);
   const [ref, bounds] = useMeasure();

-  const content = useMemo(() => {
-    const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;
-    return activeTabContent || null;
-  }, [activeTab, tabs]);

   const handleTabClick = (newTabId: number) => {
-    if (newTabId !== activeTab && !isAnimating) {
-      const newDirection = newTabId > activeTab ? 1 : -1;
-      setDirection(newDirection);
+    if (newTabId !== activeTab) {
       setActiveTab(newTabId);
       onChange?.(newTabId);
     }
   };

-  const variants = { /* ... removed ... */ };

   return (
     <div className="flex flex-col items-center w-full">
       {/* Tab buttons - unchanged */}
       
-      <MotionConfig transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}>
-        <motion.div className="relative mx-auto w-full h-full overflow-hidden" ...>
-          <div className="p-1" ref={ref}>
-            <AnimatePresence custom={direction} mode="popLayout" ...>
-              <motion.div key={activeTab} variants={variants} ...>
-                {content}
-              </motion.div>
-            </AnimatePresence>
-          </div>
-        </motion.div>
-      </MotionConfig>
+      <div className="relative mx-auto w-full overflow-hidden">
+        <div className="p-1" ref={ref}>
+          {tabs.map((tab) => (
+            <Activity key={tab.id} mode={activeTab === tab.id ? 'visible' : 'hidden'}>
+              {tab.content}
+            </Activity>
+          ))}
+        </div>
+      </div>
     </div>
   );
 }
```

---

**Status**: Ready for Review  
**Author**: Cascade  
**Created**: December 4, 2025  
**Branch**: `feature/activity-tabs`
