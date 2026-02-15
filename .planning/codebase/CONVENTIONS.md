# Coding Conventions

**Analysis Date:** 2026-02-14

## Naming Patterns

**Files:**
- Server actions: `kebab-case.ts` in `/src/actions/` directory
- Database queries: `kebab-case.ts` in `/src/lib/db/queries/`
- Database mutations: `kebab-case.ts` in `/src/lib/db/mutations/`
- React components: `PascalCase.tsx` in `/src/components/` with subdirectories by feature
- Hooks: `use-kebab-case.ts` in `/src/hooks/` with `use*` pattern
- Configuration/utility files: `kebab-case.ts` in relevant `/src/lib/` subdirectories
- Example: `pre-need-survey.ts`, `entry-feedback.ts`, `document-comments.ts`

**Functions:**
- Server actions: prefixed with action name, exported async functions with `Action` suffix or standalone
  ```typescript
  export async function updateObituaryContent({ ... }): Promise<Result>
  export const createEntryAction = action(schema, async (data) => { ... })
  ```
- Query functions: `get*` prefix for read operations
  ```typescript
  export async function getDocumentById(id: string)
  export async function getOrganizationEntries()
  ```
- Mutation functions: `create*`, `update*`, `delete*` prefixes for write operations
  ```typescript
  export const createDocumentComment = async ({ ... })
  export const updateDocumentContent = async ({ ... })
  export const deleteDocumentComment = async ({ ... })
  ```
- Hook functions: `use*` prefix returning object with state and setters
  ```typescript
  export const useCreateForm = () => { return { open, setOpen } }
  export const useEntryImage = () => { return { image, setImage, uploading, setUploading } }
  ```
- Utility functions: simple descriptive names in camelCase
  ```typescript
  function validateImageData(imageUrl, imageKey)
  const formatDate = (date) => { ... }
  const formatTime = (time) => { ... }
  ```

**Variables:**
- Constants: UPPER_SNAKE_CASE for application constants
- State/data: camelCase
- React state: camelCase for both value and setter following convention
  ```typescript
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>()
  const [isEditingObituary, setIsEditingObituary] = useState(false)
  ```
- Jotai atoms: `*Atom` suffix
  ```typescript
  export const createFormAtom = atom<boolean>(false)
  export const entryImageAtom = atom<string | null>(null)
  export const obituaryUpdateProcessingAtom = atom<boolean>(false)
  ```

**Types:**
- Interfaces: PascalCase, optional `*Props` suffix for component props
  ```typescript
  interface EntryCardProps { entry: Entry }
  interface EntryAccessResult { entry: Entry; role: EntryAccessRole; canEdit: boolean }
  interface UpdateObituaryContentParams { documentId: string; entryId: string; content: string }
  export interface EntryWithObituaries extends Entry { obituaries: Document[] }
  ```
- Union types: PascalCase describing role/status
  ```typescript
  export type EntryAccessRole = "owner" | "org_admin" | "org_member"
  export type DocumentAccessRole = "owner" | "viewer" | "commenter"
  ```
- Type aliases for database inferred types: Use Drizzle's `$inferSelect` and `$inferInsert`
  ```typescript
  type Document = typeof DocumentTable.$inferSelect
  type NewDocument = typeof DocumentTable.$inferInsert
  ```

## Code Style

**Formatting:**
- Ultracite (Biome preset) via `/biome.jsonc`
- Auto-format with: `pnpm dlx ultracite fix`
- Check formatting with: `pnpm dlx ultracite check`
- No manual formatting needed; Biome enforces all style rules automatically

**Linting:**
- Biome 2.3.11 with Ultracite preset
- Extended configs: `ultracite`, `ultracite/core`, `ultracite/next`, `ultracite/biome/core`
- TypeScript: `strict: true`, `strictNullChecks: true`
- Key rules enforced:
  - No `console.log` in production (except `console.error` for logging)
  - Use `const` by default, `let` only when reassignment needed, never `var`
  - Use arrow functions for callbacks
  - Use optional chaining (`?.`) and nullish coalescing (`??`)
  - Use template literals over string concatenation
  - Use destructuring for objects and arrays
  - Use `for...of` over `.forEach()` and indexed `for` loops

## Import Organization

**Order:**
1. Server-only marker (`import "server-only"`)
2. External libraries (React, Next.js, third-party packages)
3. Local imports from `@/` path alias
4. Types imported last with `type` keyword when possible
5. Drizzle queries and mutations imported together

**Path Aliases:**
- `@/*` maps to `src/*` (configured in `tsconfig.json`)
- Always use `@/` prefix for internal imports
- Examples:
  ```typescript
  import { documentsByEntryTag } from "@/lib/cache"
  import { updateDocumentContent } from "@/lib/db/mutations/documents"
  import { getDocumentWithAccess } from "@/lib/db/queries"
  import { auth } from "@clerk/nextjs/server"
  ```

## Error Handling

**Patterns:**
- **Server Actions:** Return `{ error: string }` or `{ success: true }` state object
  ```typescript
  if (!userId) return { error: "Unauthorized" }
  if (!entry) return { error: "Entry not found" }
  return { success: true }
  ```
- **Queries:** Throw errors with descriptive messages; return `null` for not found
  ```typescript
  try {
    const data = await db.select().from(Table).where(...)
    return data
  } catch (error) {
    console.error(error)
    throw new Error("Failed to get documents")
  }
  ```
- **Mutations:** Throw `Error` objects with user-friendly messages
  ```typescript
  if (!imageUrl || !imageKey) {
    throw new Error("Image upload incomplete. Please re-upload.")
  }
  ```
- **Try-catch blocks:** Always log errors with `console.error()` before returning/throwing
  ```typescript
  try {
    // action code
  } catch (error) {
    console.error("Failed to update survey:", error)
    return { error: "Operation failed" }
  }
  ```
- **Early returns:** Use early returns to reduce nesting
  ```typescript
  if (!userId) return { error: "Unauthorized" }
  const entry = await getEntry(id)
  if (!entry) return { error: "Not found" }
  // rest of logic
  ```

## Logging

**Framework:** `console.error()` and `console.warn()` for production logs

**Patterns:**
- Use `console.error()` in catch blocks with descriptive context
  ```typescript
  console.error("Failed to update obituary content:", error)
  console.error("Error calculating Y position:", error)
  console.error("Failed to create survey audit log:", error)
  ```
- Use `console.warn()` for non-critical issues
  ```typescript
  console.warn("[Cleanup] Manual cleanup failed:", error)
  console.warn("Could not restore anchor - text may have changed")
  ```
- Include context prefix for complex operations
  ```typescript
  console.log("Successful results", successfulResults)  // Only in development
  console.log("Epitaph IDs", epitaphIds)
  ```

## Comments

**When to Comment:**
- Explain WHY code does something, not WHAT it does (code should be self-documenting)
- Use block comments for complex business logic sections
  ```typescript
  // ============================================================================
  // Types
  // ============================================================================
  ```
- Document non-obvious requirements or constraints
  ```typescript
  // Composite primary keys (id, createdAt) for temporal tracking
  ```
- Explain access control logic
  ```typescript
  // Verify ownership before allowing edit
  if (access.role !== "owner") {
    return { error: "Only owners can edit" }
  }
  ```

**JSDoc/TSDoc:**
- Use JSDoc for public API functions and utilities
  ```typescript
  /**
   * Get entries accessible to the current user (organization-aware)
   * Returns entries where:
   * - User is the owner, OR
   * - User is in the same organization as the entry
   * Includes obituaries for each entry
   */
  export async function getOrganizationEntries(): Promise<EntryWithObituaries[]>
  ```
- Include `@param` and `@returns` for complex functions
  ```typescript
  /**
   * Validates image upload data integrity.
   * @returns Object with validated imageUrl and imageKey, or null if no image
   * @throws Error with user-friendly message if data is inconsistent
   */
  function validateImageData(...)
  ```
- Document hook return types
  ```typescript
  /**
   * Tracks whether the obituary text editor is currently active.
   * When true, the AI assistant and comment submissions are disabled
   * to prevent conflicts with manual editing.
   */
  export const isEditingObituaryAtom = atom<boolean>(false)
  ```

## Function Design

**Size:**
- Keep functions under ~50 lines when possible
- Break complex logic into smaller helper functions
- Use clear names for intermediate functions

**Parameters:**
- Use destructured objects for multiple parameters (>3)
  ```typescript
  async function getDocumentWithAccess({
    documentId,
    userId,
    orgId,
  }: {
    documentId: string
    userId: string
    orgId?: string | null
  })
  ```
- Use simple scalar types for single parameters
  ```typescript
  function formatDate(date: Date | null): string
  ```

**Return Values:**
- Explicit return types always specified (never rely on inference)
  ```typescript
  async function getOrganizationEntries(): Promise<EntryWithObituaries[]>
  async function updateObituaryContent(...): Promise<UpdateObituaryContentResult>
  ```
- Prefer union types for success/error patterns
  ```typescript
  type Result = { success: true } | { error: string }
  ```
- Use optional properties for optional returns
  ```typescript
  interface UpdateResult {
    success?: boolean
    error?: string
  }
  ```

## Module Design

**Exports:**
- Use named exports for functions in `/lib/db/queries/` and `/lib/db/mutations/`
- Use default exports for React components
  ```typescript
  export const EntryCard = ({ entry }: EntryCardProps) => { ... }
  ```
- Batch-export related mutations/queries from `index.ts`
  ```typescript
  // /src/lib/db/mutations/index.ts
  export { createEntry, updateEntry, deleteEntry } from "./entries"
  export { createDocument, updateDocument } from "./documents"
  ```

**Barrel Files:**
- Use selective re-exports in index files (avoid `export *`)
- Example in `/src/lib/db/mutations/index.ts`:
  ```typescript
  export { createEntry, updateEntry } from "./entries"
  export { createDocument } from "./documents"
  ```

**Server-Only Imports:**
- Use `import "server-only"` at the top of server-side modules to prevent client bundle leakage
  ```typescript
  import "server-only"
  import { db } from "@/lib/db"  // Database access is server-only
  ```

## Type Safety

- **Explicit type annotations:** Always specify parameter and return types
  ```typescript
  function getLocalStorage(key: string): unknown[]
  export async function getDocumentById(id: string): Promise<Document | undefined>
  ```
- **Avoid `any`:** Use `unknown` when type is genuinely unknown, use type guards
- **Const assertions:** Use `as const` for immutable values
  ```typescript
  const ROLES = ["owner", "admin", "member"] as const
  ```
- **Type narrowing:** Prefer type guards over assertions
  ```typescript
  if (error instanceof Error) {
    return { error: error.message }
  }
  ```

## Zod Validation

- Define schemas as `const` at module level
  ```typescript
  const CreateEntrySchema = z.object({
    name: z.string().min(1).max(150),
    dateOfBirth: z.string(),
    ...
  })
  ```
- Use `safeParse()` for form data handling
  ```typescript
  const result = schema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { error: result.error.message }
  }
  ```
- Use `action()` wrapper helper for server actions with validation
  ```typescript
  export const createEntryAction = action(CreateEntrySchema, async (data) => {
    // `data` is already validated and typed
  })
  ```

---

*Convention analysis: 2026-02-14*
