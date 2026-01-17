# PRD: Obituary Length Options

## Overview

Add user-selectable obituary length options (short, medium, long) to the obituary generator form. This feature moves length control from the Open Router preset into the prompt system, allowing users to choose their preferred document length.

## Problem Statement

Currently, obituary length is controlled by a hardcoded character min/max guideline in the Open Router preset. This approach:
- Lacks flexibility for users who need shorter or longer obituaries
- Doesn't scale well with the planned vector embedding system that will provide varied example lengths
- Removes user agency over a key document characteristic

## Goals

1. Provide users with three distinct length options: **Short**, **Medium**, **Long**
2. Move length control from Open Router preset into the prompt injection system
3. Maintain consistency with the existing few-shot prompting approach
4. Prepare the architecture for future vector embedding expansion

## Non-Goals

- Modifying the Open Router preset (user will handle this separately)
- Implementing vector embeddings (future work)
- Adding length options to the PDF upload flow (may be added later)

---

## Technical Specification

### Length Definitions

| Option   | Word Range    | Character Range   | Use Case                                      |
|----------|---------------|-------------------|-----------------------------------------------|
| Short    | 150-250 words | ~900-1,500 chars  | Newspaper death notices, brief announcements  |
| Medium   | 250-400 words | ~1,500-2,400 chars| Standard obituaries, most common use case     |
| Long     | 400-600 words | ~2,400-3,600 chars| Detailed life stories, memorial tributes      |

**Note:** Medium aligns with the current hardcoded 200-400 word range and will be the default.

### Type Definition

```typescript
// src/lib/ai/types.ts (or inline in prompts.ts)
export type ObituaryLength = "short" | "medium" | "long";

export const OBITUARY_LENGTH_CONFIG = {
  short: {
    label: "Short",
    description: "150-250 words, ideal for newspaper notices",
    wordMin: 150,
    wordMax: 250,
  },
  medium: {
    label: "Medium",
    description: "250-400 words, standard obituary length",
    wordMin: 250,
    wordMax: 400,
  },
  long: {
    label: "Long",
    description: "400-600 words, detailed life tribute",
    wordMin: 400,
    wordMax: 600,
  },
} as const;
```

---

## Implementation Plan

### Phase 1: Prompt System Updates
**File:** `src/lib/ai/prompts.ts`

1. **Create length configuration constant** with word/character ranges
2. **Create `getLengthGuideline()` helper function** that returns the appropriate prompt text based on length selection
3. **Update `promptFormating`** to accept a length parameter and inject the appropriate guideline
4. **Update `createPromptFromEntryData()`** to accept `length` parameter

**Example prompt injection:**
```typescript
const getLengthGuideline = (length: ObituaryLength): string => {
  const config = OBITUARY_LENGTH_CONFIG[length];
  return `TARGET LENGTH: Write between ${config.wordMin} and ${config.wordMax} words (approximately ${config.wordMin * 6}-${config.wordMax * 6} characters).`;
};
```

### Phase 2: Server Action Updates
**File:** `src/lib/ai/actions.ts`

1. **Update `ObitFormSchema`** to include `length` field with validation
2. **Pass `length` to `createPromptFromEntryData()`**
3. **Include length in the document title generation** (optional enhancement)

```typescript
const ObitFormSchema = z.object({
  // ... existing fields
  length: z.enum(["short", "medium", "long"]).default("medium"),
});
```

### Phase 3: Component Updates
**File:** `src/components/sections/obituaries/generate.tsx`

1. **Add `length` state** with default value `"medium"`
2. **Update `handleInputChange`** to handle `length` field
3. **Add `length` to form data** submission
4. **Pass `length` prop to `ObituaryOptions`**
5. **Update reset handler** to reset length to `"medium"`

### Phase 4: Options UI Updates
**File:** `src/components/sections/obituaries/options.tsx`

1. **Add `length` and `handleInputChange` to props interface**
2. **Create new RadioGroup section** for length selection
3. **Position after Style section**, before Tone section (logical grouping of document properties)

**UI Design:**
```
┌─────────────────────────────────────────────────────────┐
│ Style                                                   │
│ ○ Modern    ○ Traditional                               │
├─────────────────────────────────────────────────────────┤
│ Length                                                  │
│ ○ Short      150-250 words, ideal for newspaper notices │
│ ○ Medium     250-400 words, standard obituary length    │
│ ○ Long       400-600 words, detailed life tribute       │
├─────────────────────────────────────────────────────────┤
│ Desired Tone (Choose One)                               │
│ ...                                                     │
└─────────────────────────────────────────────────────────┘
```

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/lib/ai/prompts.ts` | Add length config, helper function, update `promptFormating` and `createPromptFromEntryData` |
| `src/lib/ai/actions.ts` | Update schema, pass length to prompt builder |
| `src/components/sections/obituaries/generate.tsx` | Add length state, form handling, props |
| `src/components/sections/obituaries/options.tsx` | Add length RadioGroup UI section |

---

## UI/UX Considerations

- **Default:** Medium (matches current behavior, least disruptive)
- **Position:** After Style, before Tone — groups document characteristics together
- **Description text:** Clear word counts help users understand the difference
- **Accessibility:** Radio group with proper labels and descriptions

---

## Testing Checklist

- [ ] Short obituary generates within 150-250 word range
- [ ] Medium obituary generates within 250-400 word range
- [ ] Long obituary generates within 400-600 word range
- [ ] Default selection is "Medium"
- [ ] Reset button resets length to "Medium"
- [ ] Length persists through regeneration
- [ ] Document title includes length indicator (if implemented)
- [ ] Form validation accepts all three length values
- [ ] TypeScript types are correctly inferred

---

## Future Considerations

1. **Vector Embeddings:** When implemented, the few-shot example selection could also filter by length to provide more relevant examples
2. **PDF Upload:** Consider adding length options to the document upload flow
3. **Custom Length:** Allow users to specify exact word counts (advanced feature)
4. **Length Estimation:** Show estimated reading time based on length selection

---

## Rollback Plan

If issues arise:
1. Revert the prompt changes to use hardcoded medium length
2. Hide the UI controls with a feature flag
3. Schema will still accept `length` but ignore it

---

## Estimated Effort

| Phase | Estimated Time |
|-------|----------------|
| Phase 1: Prompt System | 30-45 min |
| Phase 2: Server Actions | 15-20 min |
| Phase 3: Component Updates | 20-30 min |
| Phase 4: Options UI | 20-30 min |
| Testing & QA | 30-45 min |
| **Total** | **2-3 hours** |

---

## Open Questions

1. Should the document title include the length (e.g., "Modern Reverent (Short)")? ANSWER: YES
2. Should the PDF upload flow also support length options? ANSWER: YES
3. Are the proposed word ranges appropriate for the funeral industry standards? ANSWER: YES

---

## Approval

**Status:** Awaiting Review

Please review and confirm:
- [ ] Length ranges are appropriate
- [ ] UI placement is correct
- [ ] Implementation approach is acceptable
