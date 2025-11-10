# PRD: Few-Shot Prompting for Obituary Generation

**Status:** Planning  
**Branch:** `feature/few-shot-obituary-prompting`  
**Created:** 2025-11-10  
**Estimated Duration:** 4-6 hours

---

## Executive Summary

Revise the obituary generation system to use a "few-shot prompting via message history" pattern instead of the current single-shot approach. This will improve output quality by providing the AI model with concrete examples of desired input-output patterns before processing the actual request.

---

## Current State Analysis

### Existing Implementation

**File:** `src/lib/ai/actions.ts` (lines 27-103)

Current approach:
```typescript
streamText({
  model: models.openrouter,
  system: systemPrompt,
  messages: [{ role: "user", content: prompt }],
  // ...
})
```

**Problems with Current Approach:**
1. **Single-shot prompting**: The model receives only system instructions and one user prompt
2. **Abstract guidelines**: Instructions are theoretical rather than demonstrated through examples
3. **Inconsistent outputs**: Without concrete examples, the model has more room for interpretation
4. **No conversational context**: Missing the pattern-matching benefits of few-shot learning

### Current System Prompt

The `systemPrompt` (in `prompts.ts`) provides:
- General guidelines and restrictions
- Format requirements (markdown, structure)
- Word count constraints (200-400 words)
- Quote integration instructions

**Issue:** These are all *instructions* rather than *demonstrations*

---

## Goals & Objectives

### Primary Goals
1. Implement few-shot prompting with 2-3 high-quality example conversations
2. Maintain all existing functionality (quotes, religious/secular modes, custom instructions)
3. Improve consistency and quality of generated obituaries
4. Preserve streaming capability and token usage tracking

### Success Criteria
- [ ] Generated obituaries follow example structure more consistently
- [ ] Tone and style match examples more closely
- [ ] All existing features continue to work (quotes, religious mode, etc.)
- [ ] No regression in performance or user experience
- [ ] Successful A/B testing shows quality improvement

---

## Few-Shot Prompting Pattern

### Concept

Instead of:
```
System: [instructions]
User: [facts]
```

We use:
```
System: [brief core instructions]
User: [example 1 facts]
Assistant: [example 1 obituary]
User: [example 2 facts]
Assistant: [example 2 obituary]
User: [example 3 facts]
Assistant: [example 3 obituary]
User: [actual facts]
```

### Benefits
1. **Pattern recognition**: The model learns from concrete examples
2. **Consistent structure**: Examples establish the expected format
3. **Tone calibration**: Examples demonstrate the desired voice
4. **Better adherence**: Models follow examples better than abstract rules

---

## Example Obituaries (Few-Shot Training Data)

### Example 1: Traditional/Reverent Tone

**Facts:**
```
Name: Margaret Rose Thompson
Date of Birth: March 15, 1942
Date of Death: October 28, 2024
Location of Birth: Charleston, South Carolina
Location of Death: Charleston, South Carolina
Occupation: Elementary School Teacher
Years Worked: 40 years (1964-2004)
Education: Bachelor of Education, College of Charleston (1964)
Hobbies: Gardening, reading, volunteering at local food bank
Survived By: Husband of 58 years, Robert Thompson; 3 children (Susan, Mark, and Jennifer); 7 grandchildren
Service: Memorial service November 2, 2024, 2:00 PM at Grace Community Church, Charleston, SC
```

**Generated Obituary:**
```markdown
# Margaret Rose Thompson

**March 15, 1942 - October 28, 2024**

Margaret Rose Thompson, beloved wife, mother, and devoted educator, passed away peacefully in her Charleston home on October 28, 2024, at the age of 82.

Born in Charleston, South Carolina, Margaret dedicated her life to nurturing young minds and cultivating beauty in the world around her. After earning her Bachelor of Education from the College of Charleston in 1964, she embarked on a remarkable 40-year career as an elementary school teacher, touching the lives of countless students who would remember her patience, kindness, and infectious enthusiasm for learning.

Beyond the classroom, Margaret found profound joy in her garden, where she created a sanctuary of flowers and vegetables that she generously shared with neighbors and friends. An avid reader, she was rarely seen without a book in hand, and her personal library was a testament to her curious and compassionate spirit. Her commitment to service extended to the local food bank, where she volunteered weekly, embodying the values of generosity and community care she held dear.

Margaret's greatest treasures were her family. She shared 58 wonderful years with her husband, Robert, building a life filled with love, laughter, and unwavering partnership. She was a devoted mother to Susan, Mark, and Jennifer, and a cherished grandmother to seven grandchildren who brought immeasurable joy to her life.

**Survived by:** Husband Robert Thompson; children Susan, Mark, and Jennifer; and 7 grandchildren.

**Memorial Service:** November 2, 2024, at 2:00 PM, Grace Community Church, Charleston, South Carolina.

Margaret's gentle spirit, generous heart, and dedication to making the world a better place will be deeply missed by all who knew her. Her legacy lives on in the lives she touched and the love she shared.
```

---

### Example 2: Celebratory/Uplifting Tone with Military Service

**Facts:**
```
Name: James "Jim" Patrick O'Connor
Date of Birth: July 4, 1951
Date of Death: November 5, 2024
Location of Birth: Boston, Massachusetts
Location of Death: San Diego, California
Military Service: U.S. Navy
Military Rank: Lieutenant Commander
Military Years Served: 1973-1993 (20 years)
Occupation: Commercial Airline Pilot
Years Worked: 25 years (1994-2019)
Hobbies: Deep sea fishing, coaching youth baseball, storytelling
Personal Interests: Aviation history, Irish folk music
Survived By: Wife of 45 years, Patricia O'Connor; son Michael (wife Amanda); daughter Kathleen (husband David); 4 grandchildren
Donation Requests: In lieu of flowers, donations to the Navy-Marine Corps Relief Society
```

**Generated Obituary:**
```markdown
# James "Jim" Patrick O'Connor

**July 4, 1951 - November 5, 2024**

Jim O'Connor—patriot, pilot, coach, and the best storyteller you'd ever meet—took his final flight on November 5, 2024, in San Diego, California, at the age of 73.

Born on Independence Day in Boston, Massachusetts, Jim seemed destined for a life of service and adventure. After answering the call to serve his country, he spent 20 distinguished years in the U.S. Navy, rising to the rank of Lieutenant Commander. His military career took him across oceans and around the world, experiences that would later fuel the legendary stories he loved to share.

Following his honorable discharge in 1993, Jim continued to soar—this time as a commercial airline pilot for 25 years. His calm demeanor and expert skill gave thousands of passengers safe passage to their destinations, though he always joked that landing a plane was easier than coaching Little League.

And coach he did. For over two decades, Jim volunteered his time mentoring young baseball players, teaching them not just how to hit a curveball, but the values of teamwork, perseverance, and good sportsmanship. When he wasn't on the diamond or out on the deep blue sea fishing for marlin, you could find him immersed in aviation history books or filling the house with the sounds of Irish folk music—a nod to his proud heritage.

Jim's quick wit, generous spirit, and unwavering loyalty made him a beloved husband, father, grandfather, and friend. He shared 45 wonderful years with his wife, Patricia, and was immensely proud of his son Michael (and wife Amanda), daughter Kathleen (and husband David), and his four grandchildren, who affectionately called him "Captain Grandpa."

**Survived by:** Wife Patricia O'Connor; son Michael O'Connor (wife Amanda); daughter Kathleen (husband David); 4 grandchildren.

**In lieu of flowers:** Donations may be made to the Navy-Marine Corps Relief Society in Jim's memory.

Fair winds and following seas, Captain. You will be dearly missed.
```

---

### Example 3: Contemporary/Personal Tone with Quotes

**Facts:**
```
Name: Dr. Aisha Patel
Date of Birth: December 8, 1978
Date of Death: November 1, 2024
Location of Birth: Mumbai, India
Location of Death: Seattle, Washington
Education: MD, Johns Hopkins University (2004); PhD in Neuroscience, Stanford University (2009)
Occupation: Neurosurgeon and Medical Researcher
Company: Seattle Medical Center
Accomplishments: Published over 50 research papers; developed innovative surgical technique for treating pediatric brain tumors
Hobbies: Hiking, photography, cooking fusion cuisine
Personal Interests: Medical education, mentoring young physicians, classical Indian dance
Survived By: Partner Alex Chen; parents Dr. Raj and Priya Patel; sister Nisha Patel (husband James)
Service: Celebration of Life, November 10, 2024, 4:00 PM at Woodland Park Rose Garden, Seattle, WA
Special Acknowledgments: The family extends gratitude to the medical team at Seattle Medical Center
Meaningful Quote: "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate." - Ralph Waldo Emerson
```

**Generated Obituary:**
```markdown
# Dr. Aisha Patel

**December 8, 1978 - November 1, 2024**

The world lost a brilliant mind and beautiful soul when Dr. Aisha Patel passed away on November 1, 2024, in Seattle, Washington, at the age of 45.

Born in Mumbai, India, Aisha's journey was one of relentless curiosity, compassion, and excellence. She earned her MD from Johns Hopkins University in 2004 and her PhD in Neuroscience from Stanford University in 2009, establishing herself as a leader in pediatric neurosurgery. Her groundbreaking work at Seattle Medical Center, particularly her innovative surgical technique for treating pediatric brain tumors, has saved countless young lives and will continue to impact the field for generations to come. With over 50 published research papers, Aisha's intellectual contributions were matched only by her dedication to mentoring the next generation of physicians.

> "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate." - Ralph Waldo Emerson

These words, among Aisha's favorites, perfectly captured how she lived. Beyond the operating room, she found balance and joy in the natural beauty of the Pacific Northwest, hiking its trails with her camera in hand, capturing stunning landscapes. She was an extraordinary cook who delighted friends and family with fusion dishes that honored her heritage while embracing new flavors. A trained classical Indian dancer, she brought grace and artistry to everything she did.

Aisha is survived by her devoted partner, Alex Chen; her loving parents, Dr. Raj and Priya Patel; and her sister Nisha Patel (husband James). She leaves behind countless colleagues, students, and patients whose lives were forever changed by her skill, kindness, and unwavering commitment to healing.

**Celebration of Life:** November 10, 2024, at 4:00 PM, Woodland Park Rose Garden, Seattle, Washington.

The family extends heartfelt gratitude to the exceptional medical team at Seattle Medical Center for their compassionate care.

Aisha's legacy of healing, innovation, and compassion will continue to inspire all who knew her and all whose lives she touched through her work.
```

---

## Implementation Strategy

### Phase 1: Create Example Storage (1 hour)

**File:** `src/lib/ai/few-shot-examples.ts` (new file)

Create a structured storage for few-shot examples:
```typescript
interface ObituaryExample {
  id: string;
  name: string;
  tone: string; // "reverent", "celebratory", "contemporary"
  style: string; // "traditional", "modern", "personal"
  isReligious: boolean;
  hasQuotes: boolean;
  hasMilitaryService: boolean;
  facts: string; // Formatted fact string
  obituary: string; // Expected output
}

export const fewShotExamples: ObituaryExample[] = [
  // Examples from above
];
```

**Selection Strategy:**
- Match examples to user's requested tone/style
- Prioritize examples with similar features (quotes, military, religious)
- Always include 2-3 examples to establish pattern

---

### Phase 2: Update System Prompt (30 minutes)

**File:** `src/lib/ai/prompts.ts`

Revise `systemPrompt` to be more concise:
```typescript
export const fewShotSystemPrompt = `
You are a compassionate and eloquent obituary writer. Write respectful, heartfelt obituaries based strictly on provided facts.

KEY REQUIREMENTS:
- Follow the exact tone, structure, and style demonstrated in the conversation examples
- Use 200-400 words
- Include proper obituary structure (announcement, life details, survivors, services)
- Incorporate quotes naturally using markdown blockquotes (>)
- Use markdown formatting (headers, bold, italic, lists, links)
- ONLY use information provided - never add details not given
- Honor the person's memory with dignity and appropriate language

The examples in this conversation demonstrate the expected quality and approach.
`;
```

**Rationale:** Examples do the heavy lifting; system prompt provides essential constraints.

---

### Phase 3: Create Example Selector (1 hour)

**File:** `src/lib/ai/few-shot-examples.ts`

Implement intelligent example selection:
```typescript
interface SelectionCriteria {
  tone: string;
  style: string;
  isReligious: boolean;
  hasQuotes: boolean;
  hasMilitaryService: boolean;
}

export const selectExamples = (
  criteria: SelectionCriteria,
  count: number = 3
): ObituaryExample[] => {
  // Score each example by relevance
  // Return top N matches
};
```

**Scoring Logic:**
- Exact tone match: +10 points
- Exact style match: +8 points
- Religious match: +5 points
- Quote presence match: +3 points
- Military service match: +3 points

---

### Phase 4: Update generateObituary Function (1.5 hours)

**File:** `src/lib/ai/actions.ts`

Modify the `generateObituary` function:

```typescript
import { selectExamples } from './few-shot-examples';
import { fewShotSystemPrompt } from './prompts';

export const generateObituary = async (
  entryId: string,
  { data }: { data: FormData }
) => {
  // ... existing auth and parsing ...

  const prompt = await createPromptFromEntryData(
    entryId,
    style,
    tone,
    toInclude,
    toAvoid,
    isReligious,
    selectedQuoteIds
  );

  // NEW: Select relevant examples
  const examples = selectExamples({
    tone,
    style,
    isReligious,
    hasQuotes: !!selectedQuoteIds,
    hasMilitaryService: false, // TODO: detect from entry data
  });

  // NEW: Build message history
  const messages = [
    // Add examples as conversation pairs
    ...examples.flatMap(ex => [
      { role: "user" as const, content: ex.facts },
      { role: "assistant" as const, content: ex.obituary }
    ]),
    // Add actual request
    { role: "user" as const, content: prompt }
  ];

  const { textStream } = streamText({
    model: models.openrouter,
    system: fewShotSystemPrompt, // NEW: Updated system prompt
    messages, // NEW: Multiple messages instead of single
    maxOutputTokens: 1000,
    experimental_transform: smoothStream({ chunking: "word" }),
    onFinish: async ({ usage, text }) => {
      // ... existing save logic ...
    },
  });

  return {
    success: true,
    result: createStreamableValue(textStream).value,
    id,
  };
};
```

---

### Phase 5: Update generateObituaryFromDocument (1 hour)

**File:** `src/lib/ai/actions.ts`

Apply same pattern to document-based generation:
- Select appropriate examples
- Build message history
- Use few-shot system prompt

**Consideration:** Document-based generation may need different examples or a hybrid approach.

---

### Phase 6: Testing & Refinement (1-2 hours)

#### Test Cases
1. **Basic generation** - Simple entry with minimal data
2. **With quotes** - Entry with selected quotes
3. **Religious mode** - Entry with religious preferences
4. **Military service** - Entry with military details
5. **Complex entry** - All features combined
6. **Edge cases** - Missing data, unusual names, etc.

#### A/B Testing Setup
- Generate same obituary with old and new methods
- Compare quality, consistency, adherence to instructions
- Track token usage differences

#### Quality Metrics
- [ ] Consistent structure across generations
- [ ] Proper tone matching
- [ ] Quote integration quality
- [ ] Adherence to word count (200-400)
- [ ] No hallucinated information

---

## Technical Specifications

### Files to Modify
1. ✅ **Create:** `src/lib/ai/few-shot-examples.ts` (new file)
2. ✅ **Update:** `src/lib/ai/prompts.ts` (add `fewShotSystemPrompt`)
3. ✅ **Update:** `src/lib/ai/actions.ts` (`generateObituary` and `generateObituaryFromDocument`)

### Dependencies
- No new dependencies required
- Uses existing `ai` SDK capabilities
- Compatible with all current models

### Token Usage Impact

**Current approach:**
- System prompt: ~300 tokens
- User prompt: ~400-600 tokens
- **Total input:** ~700-900 tokens

**New approach:**
- System prompt: ~150 tokens (simplified)
- Example 1 (facts + obituary): ~600 tokens
- Example 2 (facts + obituary): ~600 tokens  
- Example 3 (facts + obituary): ~600 tokens
- User prompt: ~400-600 tokens
- **Total input:** ~2,350-2,550 tokens

**Analysis:**
- ~3x increase in input tokens
- Worthwhile tradeoff for quality improvement
- Still well within model context limits
- Output tokens remain unchanged (~400-600)

### Backward Compatibility
- ✅ All existing function signatures remain unchanged
- ✅ No changes to UI or form data structure
- ✅ Streaming and token tracking preserved
- ✅ Quote integration unchanged
- ✅ Religious/secular mode unchanged

---

## Risk Assessment

### Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Increased token costs | Medium | High | Monitor usage; adjust example count if needed |
| Example bias | Medium | Medium | Use diverse, well-crafted examples; periodic review |
| Poor example selection | Medium | Low | Implement robust scoring algorithm; test thoroughly |
| Regression in quality | High | Low | A/B testing before full rollout; keep old version as fallback |
| Model-specific issues | Low | Low | Test with all available models (openrouter, anthropic, openai) |

---

## Success Metrics

### Quantitative
- [ ] 20%+ improvement in user satisfaction ratings
- [ ] 30%+ reduction in revision requests
- [ ] Consistent 200-400 word count adherence (>95%)
- [ ] Zero hallucinated information incidents

### Qualitative
- [ ] Generated obituaries feel more natural and polished
- [ ] Tone consistency across similar requests
- [ ] Better quote integration
- [ ] More coherent narrative flow

---

## Future Enhancements

### Post-MVP Improvements
1. **Dynamic example generation** - Create examples on-the-fly based on entry data
2. **User feedback loop** - Learn from revised/approved obituaries
3. **Expanded example library** - More examples for edge cases
4. **Cultural sensitivity** - Examples for different cultural traditions
5. **Length variations** - Examples for short/medium/long obituaries
6. **Multi-language support** - Examples in different languages

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| 1. Example Storage | 1 hour | None |
| 2. System Prompt Update | 30 min | Phase 1 |
| 3. Example Selector | 1 hour | Phase 1 |
| 4. Update generateObituary | 1.5 hours | Phases 1-3 |
| 5. Update generateObituaryFromDocument | 1 hour | Phases 1-4 |
| 6. Testing & Refinement | 1-2 hours | All phases |
| **Total** | **6-7 hours** | |

---

## Approval & Next Steps

### Before Implementation
- [ ] Review examples for quality and diversity
- [ ] Confirm token cost increase is acceptable
- [ ] Decide on initial example count (2 or 3)
- [ ] Determine A/B testing strategy

### Implementation Checklist
- [ ] Create `few-shot-examples.ts` with all 3 examples
- [ ] Add `fewShotSystemPrompt` to `prompts.ts`
- [ ] Implement `selectExamples` function with scoring
- [ ] Update `generateObituary` to use message history
- [ ] Update `generateObituaryFromDocument` similarly
- [ ] Write unit tests for example selection
- [ ] Perform manual testing with various entries
- [ ] Document changes in code comments
- [ ] Update user-facing documentation if needed

### Post-Implementation
- [ ] Monitor first 50 generations for issues
- [ ] Gather user feedback
- [ ] Adjust examples if patterns emerge
- [ ] Consider expanding example library

---

## Appendix

### Alternative Approaches Considered

1. **Chain-of-thought prompting** - Rejected; adds complexity without clear benefit
2. **RAG with past obituaries** - Future enhancement; requires embedding infrastructure
3. **Fine-tuned model** - Too resource-intensive for current needs
4. **Prompt engineering only** - Current approach; insufficient improvement

### References
- [Few-Shot Prompting Guide](https://www.promptingguide.ai/techniques/fewshot)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenRouter Models](https://openrouter.ai/docs)

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-10  
**Author:** AI Development Team
