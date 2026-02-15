# Testing Patterns

**Analysis Date:** 2026-02-14

## Test Framework

**Status:** Not Detected

**Analysis:** No test files found in the `/src` directory. The project has 399+ TypeScript/TSX files but zero `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files in the source tree. This indicates an untested codebase.

**Available Testing Infrastructure:**
- `@biomejs/biome` (v2.3.11) - Linting and formatting (not testing)
- Ultracite preset - Code quality rules
- TypeScript (v5.9.3) - Type checking as partial test coverage

**Testing Recommendations:**
- Add a test runner (Vitest recommended for Next.js 16, Jest as alternative)
- Create test configuration file (vitest.config.ts or jest.config.js)
- Establish test directory structure

## Test Runner Configuration

**Recommended Setup:**
```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/dom
```

**Config Location:** `vitest.config.ts` (if implemented)

**Run Commands (if implemented):**
```bash
vitest                  # Run tests in watch mode
vitest run             # Run tests once (CI)
vitest --coverage      # Generate coverage report
vitest --ui            # Open test UI dashboard
```

## Test File Organization

**Recommended Pattern:**
- Location: Co-located with implementation files (preferred)
- Alternative: `__tests__` directories at same level as source files
- Naming: `{module}.test.ts` or `{module}.spec.ts` (match imports exactly)

**Example Structure:**
```
src/
├── lib/
│   ├── db/
│   │   ├── queries/
│   │   │   ├── entries.ts
│   │   │   └── entries.test.ts
│   │   └── mutations/
│   │       ├── documents.ts
│   │       └── documents.test.ts
├── actions/
│   ├── obituaries.ts
│   └── obituaries.test.ts
└── components/
    ├── sections/
    │   └── entries/
    │       ├── entry-form.tsx
    │       └── entry-form.test.tsx
```

## Test Structure

**Current Code Patterns (for reference):**

The codebase uses consistent error handling patterns that tests should verify:

```typescript
// Pattern 1: Server action return shape
type ActionResult = {
  success?: boolean
  error?: string
  [key: string]: any
}

// Pattern 2: Query result handling
async function getDocumentById(id: string) {
  try {
    const result = await db.select().from(Table).where(eq(Table.id, id))
    return result
  } catch (error) {
    console.error(error)
    throw new Error("Failed to get document")
  }
}

// Pattern 3: Mutation wrapper
export const createEntry = action(CreateEntrySchema, async (data) => {
  const { userId } = await auth()
  if (!userId) return { error: "Unauthorized" }
  // mutation logic
  return { success: true }
})
```

**Recommended Test Structure:**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { createEntry } from "@/lib/db/mutations/entries"
import * as authModule from "@clerk/nextjs/server"

describe("createEntry", () => {
  beforeEach(() => {
    // Setup: Mock auth, database, etc.
    vi.mock("@clerk/nextjs/server")
  })

  afterEach(() => {
    // Cleanup: Reset mocks
    vi.clearAllMocks()
  })

  it("should return error if user is not authenticated", async () => {
    // Arrange
    vi.mocked(authModule.auth).mockResolvedValueOnce({
      userId: null,
      orgId: null,
    } as any)

    // Act
    const result = await createEntry(validData)

    // Assert
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("should create entry with valid data and authenticated user", async () => {
    // Arrange
    vi.mocked(authModule.auth).mockResolvedValueOnce({
      userId: "user-123",
      orgId: "org-123",
    } as any)
    const entryData = { name: "John Doe", ... }

    // Act
    const result = await createEntry(entryData)

    // Assert
    expect(result).toEqual({ success: true })
    expect(mockDB.insert).toHaveBeenCalled()
  })
})
```

## Mocking

**Framework:** Vitest's `vi` object (or Jest if using Jest)

**Patterns:**

**Mocking Clerk Auth:**
```typescript
import { vi } from "vitest"
import * as authModule from "@clerk/nextjs/server"

// Mock authenticated user
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({
    userId: "user-123",
    orgId: "org-123",
  }),
}))

// Mock unauthenticated user
vi.mocked(authModule.auth).mockResolvedValueOnce({
  userId: null,
  orgId: null,
})
```

**Mocking Database (Drizzle):**
```typescript
import { vi } from "vitest"
import { db } from "@/lib/db"

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
  },
}))
```

**Mocking Next.js Cache:**
```typescript
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}))
```

**Mocking Server Actions:**
```typescript
// Server actions should be mocked at the import level
vi.mock("@/lib/db/mutations/documents", () => ({
  updateDocumentContent: vi.fn().mockResolvedValue({ success: true }),
}))
```

**What to Mock:**
- External API calls (Clerk, database, third-party services)
- File system operations
- Network requests
- Date/time (use `vi.useFakeTimers()`)
- Random values (use controlled seeding)

**What NOT to Mock:**
- Pure utility functions (formatting, validation helpers)
- Business logic that you want to test
- Internal function calls (test the public interface)
- Router/navigation (unless testing route integration)

## Fixtures and Factories

**Test Data Pattern (Recommended):**

Create factory functions for common test objects:

```typescript
// src/__tests__/factories/entry.factory.ts
export function createMockEntry(overrides?: Partial<Entry>): Entry {
  return {
    id: "entry-123",
    userId: "user-123",
    name: "John Doe",
    dateOfBirth: new Date("1950-01-01"),
    dateOfDeath: new Date("2024-01-01"),
    locationBorn: "New York, NY",
    locationDied: "Los Angeles, CA",
    image: "https://example.com/image.jpg",
    imageKey: "uploads/image123",
    causeOfDeath: "Natural causes",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function createMockDocument(overrides?: Partial<Document>): Document {
  return {
    id: crypto.randomUUID(),
    entryId: "entry-123",
    userId: "user-123",
    title: "Obituary for John Doe",
    content: "John was a loving father...",
    kind: "obituary",
    status: "draft",
    tokenUsage: 250,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
```

**Location:**
- Place factories in `src/__tests__/factories/` or `tests/fixtures/`
- Name patterns: `{entity}.factory.ts`, `{entity}.fixture.ts`

**Usage in Tests:**
```typescript
import { createMockEntry, createMockDocument } from "@/__tests__/factories"

it("should display entry with documents", async () => {
  const entry = createMockEntry({ name: "Jane Doe" })
  const document = createMockDocument({ entryId: entry.id })

  const result = await getEntryWithDocuments(entry.id)
  expect(result).toEqual({ entry, documents: [document] })
})
```

## Coverage

**Status:** Not enforced

**Target:** Establish baseline before enforcing thresholds

**Recommended Implementation:**
```typescript
// vitest.config.ts (if implemented)
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.stories.tsx",
      ],
      lines: 70,     // Enforce 70% line coverage
      functions: 70,
      branches: 60,
      statements: 70,
    },
  },
})
```

**View Coverage (if implemented):**
```bash
vitest run --coverage
open coverage/index.html  # View HTML report
```

## Test Types

**Unit Tests (Recommended Priority):**
- **Scope:** Test single functions in isolation
- **Approach:** Mock dependencies, test happy path and error cases
- **Location:** `src/lib/db/queries/`, `src/lib/db/mutations/`, utilities
- **Examples:**
  ```typescript
  // Test query function returns correct data
  it("getDocumentById returns document when found", async () => {})
  it("getDocumentById throws error when query fails", async () => {})

  // Test mutation with validation
  it("createEntry rejects invalid email format", async () => {})
  it("createEntry stores entry in database", async () => {})

  // Test utility functions
  it("formatDate formats date correctly", () => {})
  it("formatTime converts 24h to 12h format", () => {})
  ```

**Integration Tests (Medium Priority):**
- **Scope:** Test multiple functions working together
- **Approach:** Use real database or in-memory version, mock external APIs only
- **Examples:**
  ```typescript
  // Test full flow: create entry → get entry → verify output
  it("should create and retrieve entry", async () => {})

  // Test document workflow: create → update → status change
  it("should update document and invalidate cache", async () => {})
  ```

**End-to-End Tests (Lower Priority - Not Implemented):**
- **Framework:** Playwright or Cypress (if implemented)
- **Scope:** Test full user workflows in browser
- **Would test:** Form submissions, document generation, sharing flows

## Common Patterns

**Async Testing:**
```typescript
// Correct: Use async/await
it("should fetch document", async () => {
  const result = await getDocumentById("doc-123")
  expect(result).toBeDefined()
})

// Incorrect (old pattern, don't use):
it("should fetch document", (done) => {
  // Don't use done callbacks
})
```

**Error Testing:**
```typescript
// Test error thrown
it("should throw error when document not found", async () => {
  vi.mocked(getDocumentById).mockRejectedValueOnce(
    new Error("Not found")
  )

  await expect(getDocumentById("missing")).rejects.toThrow("Not found")
})

// Test error returned in result
it("should return error for unauthorized user", async () => {
  vi.mocked(auth).mockResolvedValueOnce({ userId: null, orgId: null })

  const result = await updateEntryAction(data)
  expect(result).toEqual({ error: "Unauthorized" })
})
```

**Testing with FormData (Server Actions):**
```typescript
it("should handle form submission", async () => {
  const formData = new FormData()
  formData.append("name", "John Doe")
  formData.append("dateOfBirth", "1950-01-01")

  const result = await createEntryAction({}, formData)
  expect(result.success).toBe(true)
})
```

**Mocking Time:**
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("Cache expiration", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should expire cache after timeout", () => {
    const cache = new Cache()
    cache.set("key", "value")

    vi.advanceTimersByTime(60000)  // Advance 60 seconds

    expect(cache.get("key")).toBeUndefined()
  })
})
```

## Test Naming Conventions

**Recommended Patterns:**
```typescript
// Descriptive test names starting with "should"
describe("createEntry", () => {
  it("should create entry with valid data", () => {})
  it("should return error if user not authenticated", () => {})
  it("should validate entry name is not empty", () => {})
  it("should set organization ID when user has organization", () => {})
})

describe("getDocumentWithAccess", () => {
  it("should return document with owner role for document creator", () => {})
  it("should return null if user has no access", () => {})
  it("should return commenter role for organization members", () => {})
})
```

## Current State

**No test files exist in the codebase.** All testing capabilities are deferred to future implementation.

**To Enable Testing:**
1. Install test runner: `pnpm add -D vitest @vitest/ui @testing-library/react`
2. Create `vitest.config.ts` at project root
3. Create `src/__tests__/` directory for shared fixtures and utilities
4. Create first test files co-located with implementation files
5. Start with critical business logic: mutations, auth checks, validation

---

*Testing analysis: 2026-02-14*
