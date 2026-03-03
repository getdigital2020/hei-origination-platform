# Code Review

Review the recent changes in this project. Check against our Tier 3 Application principles.

## Security (Critical)

1. **Authentication** — Are protected routes guarded? Is session/token validation applied?
2. **Input Validation** — Client AND server-side validation with Zod on all form handlers and API inputs?
3. **Secrets** — No hardcoded API keys, S3 credentials, or database URLs? No sensitive data in logs?
4. **SQL Injection** — Prisma parameterized queries only? No raw SQL with user input?
5. **Financial Data** — PII and financial data handled securely? Encrypted at rest and in transit?
6. **S3 Access** — S3 bucket policies restrictive? Signed URLs used for document access?
7. **PDF Security** — No user-controlled HTML injection in Puppeteer-generated PDFs?
8. **CSRF** — CSRF protection on all state-changing forms?

## Accessibility

1. **Semantic HTML** — Proper heading hierarchy, landmarks, form labels?
2. **Keyboard Navigation** — All interactive elements reachable via keyboard?
3. **Color Contrast** — WCAG 2.1 AA ratios (4.5:1 text, 3:1 large text)?
4. **Alt Text** — Meaningful alt text on informational images?
5. **Focus Indicators** — Visible focus rings on interactive elements?
6. **Form Errors** — Error messages associated with inputs via aria-describedby?

## Performance

1. **Images** — Next.js Image component with proper sizing?
2. **Code Splitting** — Dynamic imports for heavy components (PDF viewer, Puppeteer)?
3. **Database Queries** — No N+1 queries? Prisma includes/selects optimized?
4. **PDF Generation** — Puppeteer instances reused? Timeouts configured?

## Error Handling

1. **Error Messages** — Say what happened + what to do next? No raw errors shown?
2. **Loading States** — Skeleton screens or spinners for async operations?
3. **Form Recovery** — Form state preserved on submission errors?
4. **API Failures** — Graceful degradation when external services are down?

## Code Quality

1. **DRY** — No duplicated logic? Shared utilities used?
2. **Type Safety** — Proper TypeScript types, no `any` escape hatches?
3. **Naming** — Semantic, descriptive names?
4. **Separation of Concerns** — Business logic not mixed with UI rendering?

## For Each Issue Found

State:
- **What** the issue is
- **Where** (file path and line number)
- **Why** it matters (reference the specific principle)
- **How** to fix it
- **Severity**: critical > warning > suggestion

Prioritize: security > accessibility > correctness > performance > style.
