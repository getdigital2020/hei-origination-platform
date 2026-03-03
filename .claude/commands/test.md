---
name: test
description: Create comprehensive tests for specified code
user-invocable: true
---

# Generate Tests

Create comprehensive tests for: $ARGUMENTS

## Instructions

1. **Check existing patterns** — Read existing test files to match the project's testing conventions. Suggest Vitest if no test framework is configured.

2. **Determine test location** — Place test files adjacent to source files as `[filename].test.ts(x)` or in the project's test directory (match existing convention).

3. **Write tests covering:**
   - Happy path — the expected behavior works
   - Edge cases — boundary values, empty inputs, max lengths
   - Error cases — invalid input, API failures, unauthorized access
   - Financial calculations — verify precision, rounding, edge cases with currency

4. **Mock external dependencies:**
   - Prisma — mock the client with `@prisma/client` jest mock or vitest mock
   - S3 — mock AWS SDK calls for document upload/download
   - Puppeteer — mock browser instance for PDF generation tests
   - External APIs — mock with MSW or manual mocks

5. **Test isolation:** No shared state between tests, deterministic, order-independent.

6. **For API routes, always test:**
   - Authentication required (401 without token)
   - Authorization enforced (403 for wrong role)
   - Input validation (400 for bad input, test Zod schemas)
   - Success case (200/201 with correct response shape)

7. **For PDF generation, test:**
   - Template renders with valid data
   - Missing/null fields handled gracefully
   - Output format and structure correct

8. **Run the tests** after writing to confirm they pass:
   ```bash
   npm run test -- --run [test-file-path]
   ```
