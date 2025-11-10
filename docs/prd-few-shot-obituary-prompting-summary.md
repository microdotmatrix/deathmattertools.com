# Few-Shot Obituary Prompting - Quick Reference

**Status:** Planning  
**Branch:** `feature/few-shot-obituary-prompting`  
**Est. Duration:** 6-7 hours

---

## What We're Building

Replace single-shot prompting with few-shot prompting by providing 2-3 example conversations (facts → obituary) before the actual request. This teaches the model by demonstration rather than instruction.

---

## Why

**Current Problems:**
- Inconsistent output quality
- Model interprets abstract instructions differently
- No concrete examples to follow

**Benefits:**
- Better pattern recognition
- More consistent structure and tone
- Improved adherence to requirements

---

## How It Works

**Before (Single-Shot):**
```
System: [long instructions]
User: [facts]
→ Assistant generates obituary
```

**After (Few-Shot):**
```
System: [concise core instructions]
User: [example 1 facts]
Assistant: [example 1 obituary]
User: [example 2 facts]
Assistant: [example 2 obituary]
User: [actual facts]
→ Assistant generates obituary following examples
```

---

## Implementation Plan

### Phase 1: Example Storage (1h)
Create `src/lib/ai/few-shot-examples.ts`:
- Define `ObituaryExample` interface
- Store 3 high-quality examples
- Implement `selectExamples()` function

### Phase 2: System Prompt (30m)
Update `src/lib/ai/prompts.ts`:
- Add simplified `fewShotSystemPrompt`
- Remove redundant instructions (examples handle it)

### Phase 3: Example Selector (1h)
Smart selection based on:
- Tone match (+10 pts)
- Style match (+8 pts)
- Religious match (+5 pts)
- Quote/military match (+3 pts each)

### Phase 4: Update Main Function (1.5h)
Modify `generateObituary()`:
- Select relevant examples
- Build message array
- Use new system prompt

### Phase 5: Update Document Function (1h)
Apply same pattern to `generateObituaryFromDocument()`

### Phase 6: Testing (1-2h)
- Unit tests for selection
- Manual testing various scenarios
- A/B comparison with old method

---

## Key Files

| File | Action | Description |
|------|--------|-------------|
| `src/lib/ai/few-shot-examples.ts` | **CREATE** | Example storage & selection logic |
| `src/lib/ai/prompts.ts` | **UPDATE** | Add `fewShotSystemPrompt` |
| `src/lib/ai/actions.ts` | **UPDATE** | Modify `generateObituary()` |
| `src/lib/ai/actions.ts` | **UPDATE** | Modify `generateObituaryFromDocument()` |

---

## Example Templates

### 1. Traditional/Reverent
- Elementary school teacher, 82
- 40-year career, gardening hobby
- Survived by husband, 3 children, 7 grandchildren
- Memorial service details

### 2. Celebratory/Military
- Navy veteran (Lt. Commander, 20 years)
- Commercial pilot, baseball coach
- Storyteller with quick wit
- Deep sea fishing enthusiast

### 3. Contemporary/Professional
- Neurosurgeon & researcher
- Innovative medical contributions
- Hiking, photography, fusion cooking
- Includes meaningful quote

---

## Token Impact

| Metric | Current | New | Change |
|--------|---------|-----|--------|
| System Prompt | ~300 | ~150 | -50% |
| Examples | 0 | ~1,800 | +1,800 |
| User Prompt | ~500 | ~500 | 0 |
| **Total Input** | **~800** | **~2,450** | **+3x** |

**Worth it?** Yes - quality improvement justifies cost increase.

---

## Testing Checklist

- [ ] Basic generation (minimal data)
- [ ] With selected quotes
- [ ] Religious mode enabled
- [ ] Military service present
- [ ] Complex entry (all features)
- [ ] Edge cases (missing data)
- [ ] A/B comparison with old method
- [ ] Token usage monitoring

---

## Success Metrics

- 20%+ improvement in satisfaction
- 30%+ fewer revision requests  
- 95%+ word count adherence (200-400)
- Zero hallucinations

---

## Risks

| Risk | Mitigation |
|------|------------|
| Higher token costs | Monitor usage; adjust example count |
| Example bias | Use diverse examples; periodic review |
| Poor selection | Robust scoring algorithm |
| Quality regression | A/B test before rollout |

---

## Next Steps

1. ✅ Review PRD
2. ⏳ Implement Phase 1 (Example Storage)
3. ⏳ Implement Phase 2 (System Prompt)
4. ⏳ Implement Phase 3 (Selection Logic)
5. ⏳ Implement Phase 4 (Main Function)
6. ⏳ Implement Phase 5 (Document Function)
7. ⏳ Implement Phase 6 (Testing)

---

**Full PRD:** `docs/prd-few-shot-obituary-prompting.md`
