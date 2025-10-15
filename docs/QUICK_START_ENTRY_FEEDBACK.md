# 🚀 Entry Feedback - Quick Start

**Status:** Production Ready  
**Read Time:** 2 minutes

---

## What Is It?

A collaboration tool for organization members to provide feedback on entry details (dates, locations, etc.) with state management by entry creators.

**Not the same as:** Obituary comments (which are for condolences/memories)

---

## Quick Reference

### Where to Find It
```
Entry Page → Scroll down → "💬 Entry Feedback & Collaboration"
```

### Who Can Do What

**Everyone (Org Members):**
- ✅ Add feedback
- ✅ View all feedback
- ✅ Edit/delete own pending feedback

**Entry Creators Only:**
- ✅ All of the above, plus:
- ✅ Approve/deny feedback
- ✅ Mark as resolved

---

## 30-Second Guide

### Add Feedback
1. Type suggestion (max 2000 chars)
2. Click "Submit Feedback"
3. Done! ✅

### Manage Feedback (Creators)
1. Review pending feedback
2. Click "Approve" or "Deny"
3. Fix issue if approved
4. Click "Mark as Resolved"

---

## Status Colors

| Icon | Status | Color | Meaning |
|------|--------|-------|---------|
| 🕐 | Pending | Amber | Awaiting review |
| ✅ | Approved | Green | Valid feedback |
| ✓ | Resolved | Gray | Issue fixed |
| ❌ | Denied | Red | Not valid |

---

## Best Practices

✅ **Good Feedback:**
- "Date of birth should be 1985"
- "Middle name 'James' is missing"
- "Typo in cause of death"

❌ **Bad Feedback:**
- "Wrong"
- "Fix this"
- "Incorrect"

---

## Common Questions

**Q: Who can see my feedback?**  
A: Only members of your organization.

**Q: Can I delete feedback after approval?**  
A: No. Only pending feedback can be deleted.

**Q: How do I know if my feedback helped?**  
A: Check if it's marked "Approved" or "Resolved".

---

## File Locations (Developers)

```
Schema:     src/lib/db/schema/entry-feedback.ts
Queries:    src/lib/db/queries/entry-feedback.ts
Actions:    src/actions/entry-feedback.ts
Components: src/components/sections/entry-feedback/
UI:         src/app/[entryId]/page.tsx
```

---

## Testing Checklist

- [ ] Add feedback as org member
- [ ] Edit pending feedback
- [ ] Delete pending feedback
- [ ] Approve feedback as creator
- [ ] Deny feedback as creator
- [ ] Resolve approved feedback
- [ ] Verify non-org users blocked
- [ ] Test on mobile

---

## Documentation

| Document | Purpose |
|----------|---------|
| `prd-entry-feedback.md` | Full technical spec |
| `entry-feedback-user-guide.md` | End-user guide |
| `entry-feedback-testing-guide.md` | QA procedures |
| `ENTRY_FEEDBACK_COMPLETE.md` | Implementation summary |

---

## Deployment

```bash
# 1. Apply migration (if not done)
pnpm db:push

# 2. Verify table
# Check database for v1_entry_feedback table

# 3. Deploy
# Use your normal deployment process

# 4. Test
# Add feedback on production
```

---

## Support

**Issues?** Check:
1. User guide (FAQ section)
2. Testing guide (troubleshooting)
3. Your team administrator

---

**Version:** 1.0.0  
**Updated:** 2025-01-15  
**Status:** ✅ Production Ready
