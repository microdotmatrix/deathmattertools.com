# PRD: Education Field Enhancement

## Overview

Enhance the education field in the obituary details form from a simple text input to a structured, multi-field system similar to the existing service details implementation. This will provide better data organization, improved user experience, and more comprehensive education information capture.

## Current State

- Single textarea input for education (line 418-426 in `details-form.tsx`)
- One `education` column in `EntryDetailsTable` (line 60 in `entries.ts`)
- Free-form text input allowing users to enter any education information

## Proposed Enhancement

### New Data Structure

Replace the single education field with a structured array of education entries, similar to service details:

```typescript
interface Education {
  id: string;
  type: string; // dropdown: high-school, ged, vocational, college, advanced-degree, other
  institution: string; // text input for school name/location
  yearGraduated: number; // dropdown selector 1900-2025
}
```

### Database Schema Changes

Add new columns to `EntryDetailsTable` while preserving the existing `education` column for backward compatibility:

```sql
-- New columns to add
education_details text,     -- JSON array of Education objects
education_types text,       -- Comma-separated list of education types (for easy querying)
education_years text,       -- Comma-separated list of graduation years (for easy querying)
```

### Form UI Changes

#### Education Section Layout

- Replace the current single textarea (lines 418-426) with a new structured education section
- Add "Add Education" button similar to service details
- Each education entry will have:
  - **Education Type** dropdown with options:
    - High School
    - GED
    - Vocational/Technical School
    - College/University
    - Advanced Degree (Master's, PhD, etc.)
    - Other
  - **School Name/Location** text input
  - **Year Graduated** dropdown (1900-2025)
  - Remove button for each entry

#### Component Structure

Create new components following the service details pattern:

- `EducationInputs` component for managing education entries
- Helper functions for serialization/deserialization
- Integration with existing form state management

### Implementation Plan

#### Phase 1: Database Schema (2-3 hours)

1. Add new columns to `EntryDetailsTable`
2. Generate and apply migration
3. Update TypeScript types
4. Test database changes

#### Phase 2: Form Components (4-5 hours)

1. Create `Education` interface and helper functions
2. Build `EducationInputs` component
3. Add education state management functions
4. Integrate with existing form structure
5. Update `BiographicalDetailsStep` component

#### Phase 3: Data Handling (2-3 hours)

1. Add serialization/deserialization functions
2. Update form submission logic
3. Handle backward compatibility with existing `education` field
4. Update validation schemas

#### Phase 4: Testing & Integration (2-3 hours)

1. Test form functionality
2. Test data persistence
3. Verify backward compatibility
4. Update any related components that consume education data

### Backward Compatibility Strategy

#### Data Migration

- **Preserve existing data**: Keep the original `education` column intact
- **Display legacy data**: If `education_details` is empty but `education` has content, display the legacy data in a read-only format
- **Gradual migration**: Allow users to gradually migrate from old format to new structured format

#### Display Logic

```typescript
// Display priority:
// 1. If education_details exists, use structured format
// 2. If only education exists, show legacy text with option to convert
// 3. If both exist, prioritize structured format
```

#### Form Validation

- Remove `education` from required field validation
- Add validation for new structured fields
- Allow submission with either format during transition period

### Technical Considerations

#### Performance

- JSON storage for education details (similar to service details)
- Indexed text fields for common queries (education_types, education_years)
- Efficient serialization/deserialization

#### User Experience

- Clear visual distinction between old and new formats
- Helpful placeholders and examples
- Smooth transition from textarea to structured inputs
- Maintain form's existing multi-step structure

#### Data Integrity

- Proper TypeScript typing for new education structure
- Validation for year ranges (1900-2025)
- Sanitization of institution names
- Unique IDs for education entries

### Files to Modify

#### Primary Files

1. `src/lib/db/schema/entries.ts` - Add new database columns
2. `src/components/sections/entries/details-form.tsx` - Replace education UI
3. `src/lib/validations/entries.ts` - Update validation schemas (if exists)

#### Supporting Files

- Any API routes that handle education data
- Components that display education information
- Export/import functionality (if exists)

### Success Criteria

#### Functional Requirements

- [ ] Users can add multiple education entries
- [ ] Each entry has type, institution, and year
- [ ] Form validation works correctly
- [ ] Data persists to database properly
- [ ] Legacy education data still displays

#### User Experience Requirements

- [ ] Interface is intuitive and follows service details pattern
- [ ] Year dropdown includes all years 1900-2025
- [ ] Education type dropdown includes all specified options
- [ ] Clear error messages and validation feedback

#### Technical Requirements

- [ ] Database migration runs successfully
- [ ] No data loss during migration
- [ ] Backward compatibility maintained
- [ ] TypeScript types are correct
- [ ] Form submission works with both old and new data formats

### Risk Mitigation

#### Data Loss Prevention

- Always preserve original `education` column
- Test migration on development branch first
- Create backup before production migration

#### User Confusion

- Clear labeling during transition period
- Helpful tooltips and examples
- Progressive disclosure of advanced features

#### Performance Impact

- Monitor database query performance
- Optimize JSON parsing for large education arrays
- Consider pagination if users add many entries

### Timeline Estimate

**Total: 10-14 hours**

- Database Schema: 2-3 hours
- Form Components: 4-5 hours
- Data Handling: 2-3 hours
- Testing & Integration: 2-3 hours

### Dependencies

- No external dependencies required
- Uses existing UI components (Select, Input, Button)
- Follows established patterns from service details implementation

### Future Enhancements

- Education degree specification for advanced degrees
- Field of study input
- GPA or achievements input
- Integration with education verification services
