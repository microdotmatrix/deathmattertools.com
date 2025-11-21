# PRD: Entry Details Form Improvements

**Feature Branch:** `feature/entry-details-improvements`  
**Status:** In Development  
**Created:** November 20, 2025  
**Priority:** Medium

---

## Overview

This PRD outlines improvements to the Entry Details form components, focusing on enhancing user experience through better input controls and data validation. The primary goal is to replace free-text inputs with structured select dropdowns where predefined options are more appropriate.

## Objectives

1. **Improve data consistency** - Standardize relationship values across entries
2. **Enhance UX** - Make it easier for users to select appropriate options
3. **Reduce data entry errors** - Eliminate typos and inconsistent formatting
4. **Enable better filtering/reporting** - Structured data allows for aggregation and analytics

---

## Scope

### Phase 1: Family Member Relationships (Immediate)

**Component:** `FamilyMemberInputs` in `src/components/sections/entries/details-form.tsx`

**Current State:**

- Relationship is a free-text `Input` field
- Users can enter any text, leading to inconsistent data

**Target State:**

- Replace text input with shadcn `Select` component
- Predefined relationship options

#### Relationship Options

The following relationship types will be available:

| Value        | Display Label |
| ------------ | ------------- |
| `parent`     | Parent        |
| `child`      | Child         |
| `ancestor`   | Ancestor      |
| `descendant` | Descendant    |
| `cousin`     | Cousin        |
| `friend`     | Friend        |
| `spouse`     | Spouse        |
| `other`      | Other         |

**Implementation Details:**

- Maintain existing functionality (add/remove family members)
- Preserve the name input as free text
- Update the `FamilyMember` interface if needed
- Ensure mobile responsiveness is maintained
- Apply consistent styling with existing Select components in the form

---

### Phase 2: Additional Form Fields (Future)

The following fields are candidates for similar improvements:

#### Military Branch Selection

**Field:** `militaryBranch` (currently free text)  
**Suggested Options:**

- Army
- Navy
- Air Force
- Marines
- Coast Guard
- Space Force
- National Guard
- Reserves
- Other

#### Religious Denomination

**Field:** `denomination` (currently free text)  
**Suggested Options:**

- Catholic
- Protestant
- Baptist
- Methodist
- Lutheran
- Presbyterian
- Episcopal
- Orthodox
- Non-denominational
- Other
- Prefer not to say

#### Education Level

**Field:** `education` (currently free text)  
**Suggested Options:**

- High School Diploma/GED
- Associate Degree
- Bachelor's Degree
- Master's Degree
- Doctorate/PhD
- Professional Degree
- Trade/Vocational Certificate
- Some College
- Other

---

## Technical Requirements

### Dependencies

- **shadcn/ui Select component** - Already installed and imported in the file
- No additional dependencies required

### Component Structure

```tsx
<Select
  value={member.relationship}
  onValueChange={(value) =>
    updateFamilyMember?.(type, member.id, "relationship", value)
  }
>
  <SelectTrigger className="w-full lg:w-[200px]">
    <SelectValue placeholder="Relationship" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="parent">Parent</SelectItem>
    <SelectItem value="child">Child</SelectItem>
    <SelectItem value="ancestor">Ancestor</SelectItem>
    <SelectItem value="descendant">Descendant</SelectItem>
    <SelectItem value="cousin">Cousin</SelectItem>
    <SelectItem value="friend">Friend</SelectItem>
    <SelectItem value="spouse">Spouse</SelectItem>
    <SelectItem value="other">Other</SelectItem>
  </SelectContent>
</Select>
```

### Type Safety

Ensure the `FamilyMember` interface properly types the relationship field:

```typescript
interface FamilyMember {
  id: string;
  name: string;
  relationship: string; // Consider: 'parent' | 'child' | 'ancestor' | etc. for stricter typing
}
```

---

## Design Considerations

### Consistency

- Match existing Select component styling in the form (e.g., DateTimePicker, other selects)
- Maintain the same layout structure (flex column on mobile, flex row on desktop)
- Keep the same spacing and border radius as other form inputs

### Accessibility

- Ensure keyboard navigation works properly
- Maintain ARIA labels and descriptions
- Test with screen readers

### Mobile Responsiveness

- Select dropdown should display properly on mobile devices
- Touch targets should be appropriately sized
- Maintain the existing responsive classes: `w-full lg:w-[200px]`

---

## Implementation Plan

### Step 1: Update FamilyMemberInputs Component ✅

- [ ] Replace `Input` with `Select` component for relationship field
- [ ] Add all predefined relationship options
- [ ] Update `onValueChange` handler to work with Select
- [ ] Ensure mobile responsiveness

### Step 2: Testing

- [ ] Test add/remove family member functionality
- [ ] Test relationship selection and data persistence
- [ ] Test mobile layout and interactions
- [ ] Verify form submission with new Select values

### Step 3: Database Considerations

- [ ] Check if existing entries have free-text relationships that need migration
- [ ] Consider adding a database enum for relationship types (optional)
- [ ] Document expected values in schema if using strict typing

### Step 4: Future Enhancements (Phase 2)

- [ ] Implement military branch select
- [ ] Implement denomination select
- [ ] Implement education level select
- [ ] Create reusable form field components if pattern emerges

---

## Testing Checklist

- [ ] Can add new family members
- [ ] Can remove family members
- [ ] Relationship select displays all options
- [ ] Selected relationship persists correctly
- [ ] Name input still works as free text
- [ ] Mobile layout displays correctly
- [ ] Desktop layout displays correctly
- [ ] Form submission includes correct relationship values
- [ ] Existing entries with old data display gracefully

---

## Success Metrics

1. **Data Quality**
   - 100% of new entries use standardized relationship values
   - Zero spelling variations in relationship data

2. **User Experience**
   - Reduced time to complete family member section
   - Fewer form validation errors
   - Positive user feedback on dropdown vs text input

3. **Technical**
   - No regression in existing functionality
   - Component remains performant
   - Maintains accessibility standards

---

## Future Considerations

### Potential Enhancements

1. **Custom relationship option** - Allow users to type a custom relationship if "Other" is selected
2. **Relationship grouping** - Group related options (e.g., "Family", "Friends", "Other")
3. **Smart defaults** - Pre-select common relationships based on context
4. **Multi-select** - Allow specifying multiple relationships (e.g., "Cousin and Friend")

### Related Work

- Consider applying this pattern to other form sections
- Create a design system documentation for form field types
- Establish guidelines for when to use Select vs Input

---

## References

- **Component File:** `src/components/sections/entries/details-form.tsx`
- **shadcn/ui Select Docs:** https://ui.shadcn.com/docs/components/select
- **Related Components:** `AnimatedInput`, `DateTimePicker`, existing Select usage in form

---

## Notes

- The Select component is already imported in the file (lines 17-22)
- Existing Select usage for other fields shows the pattern is established
- Mobile responsive classes are already in use: `w-full lg:w-fit`, `lg:w-[200px]`
- The `updateFamilyMember` function accepts the value and updates state appropriately
