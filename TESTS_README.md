# Test Suite Documentation (Frontend)

This document explains the purpose and coverage of all **frontend** (Vitest / React Testing Library) test files in this repository.

The **backend test documentation has been moved** to its own file for clarity:

➡️ See **Backend Test Documentation** here: [`backend/TEST_README.md`](backend/TEST_README.md)

Each section below uses HTML `<details>` dropdowns so you can expand to see a concise breakdown of what each individual test case validates.

---
## Frontend Tests (Vite + Vitest + React Testing Library)

### UI Components

<details>
<summary><strong>src/test/ui/components/Button.test.tsx</strong></summary>
<ul>
<li><em>Renders variants / sizes:</em> Ensures all style variants (default, outline, destructive, etc.) and sizes (sm, md, lg) render without errors.</li>
<li><em>Disabled state:</em> Verifies the button respects the disabled prop and prevents click actions.</li>
<li><em>Loading / spinner (if implemented):</em> Confirms the visual feedback or text for loading state is shown.</li>
<li><em>Pass-through props / class merges:</em> Asserts custom className / children rendering.</li>
</ul>
</details>

<details>
<summary><strong>src/test/ui/components/Layout.test.tsx</strong></summary>
<ul>
<li><em>renders navigation items for user role:</em> Ensures role-allowed nav links (Dashboard, My Tickets) appear for an L1 user.</li>
<li><em>toggles mobile menu:</em> Simulates mobile menu button click and verifies overlay (drawer open state) appears.</li>
</ul>
</details>

<details>
<summary><strong>src/test/ui/components/CreateTicketDialog.test.tsx</strong></summary>
<ul>
<li><em>returns null when closed:</em> Component should not render DOM when <code>isOpen</code> is false.</li>
<li><em>validates required fields (title & description):</em> Submitting empty form shows validation messages driven by zod + react-hook-form.</li>
<li><em>submits valid form:</em> Fills required inputs, selects category & priority, confirms API mutation is called and dialog closes.</li>
</ul>
</details>

<details>
<summary><strong>src/test/ui/components/LogoutModal.test.tsx</strong></summary>
<ul>
<li><em>returns null when closed:</em> Modal does not render hidden state.</li>
<li><em>renders and triggers callbacks:</em> Clicking Cancel calls <code>onCancel</code>; clicking Logout calls <code>onConfirm</code>.</li>
</ul>
</details>

### Page-Level Tests

<details>
<summary><strong>src/test/ui/pages/LoginPage.test.tsx</strong></summary>
<ul>
<li><em>should render login form:</em> Core static UI (fields, heading, action button) present.</li>
<li><em>validation errors empty fields:</em> Submitting blank form triggers zod messages.</li>
<li><em>invalid email format:</em> Email lacking valid TLD triggers custom validation.</li>
<li><em>loading state:</em> Button shows "Signing in..." and is disabled when auth slice <code>isLoading</code> true.</li>
<li><em>error message:</em> Renders backend/auth error from store when present.</li>
<li><em>submit updates auth state:</em> Dispatches login thunk, mocks API, asserts user stored & authenticated.</li>
<li><em>demo account autofill:</em> Demo tile populates email/password fields correctly.</li>
</ul>
</details>

<details>
<summary><strong>src/test/ui/pages/TicketListPage.test.tsx</strong></summary>
<ul>
<li><em>renders ticket list:</em> Confirms fetched tickets display basic row data.</li>
<li><em>shows loading state:</em> Loading indicator appears while query fetching.</li>
<li><em>shows empty state:</em> Displays empty tickets illustration / message when no results.</li>
<li><em>pagination controls:</em> Verifies presence of next/previous page controls (core navigation exists).</li>
</ul>
</details>

<details>
<summary><strong>src/test/ui/pages/TicketDetailPage.test.tsx</strong></summary>
<ul>
<li><em>loading state:</em> Shows skeleton/loading copy while ticket query is pending.</li>
<li><em>not found handling:</em> Displays fallback + navigation button for missing ticket.</li>
<li><em>back navigation:</em> Clicking Back triggers navigation call.</li>
<li><em>ticket detail display:</em> Renders key ticket fields (id, level, status, description, priority, category).</li>
<li><em>critical value label:</em> Shows severity label component when present.</li>
<li><em>L1 start working:</em> Transitions status from New to Attending via mutation.</li>
<li><em>L1 escalation:</em> L1 allowed to escalate to L2; mutation called with correct target.</li>
<li><em>L2 critical value update:</em> Hidden select trigger interaction updates critical value (mutation fired).</li>
<li><em>L2 escalate to L3:</em> Allows escalation only when severity is C1/C2.</li>
<li><em>status update error:</em> Verifies mutation still invoked (error path covered by toast logic indirectly).</li>
<li><em>escalation error:</em> Same approach for escalation failure.</li>
</ul>
</details>

### Unit / Utility Tests

<details>
<summary><strong>src/test/unit/utils.test.ts</strong></summary>
<ul>
<li><em>Utility formatting helpers:</em> Ensures functions like date formatters, class name combiners, badge color resolvers, etc., return expected outputs for representative inputs.</li>
<li><em>Edge cases:</em> Handles null/undefined or boundary conditions where applicable.</li>
</ul>
</details>

<details>
<summary><strong>src/test/unit/api.test.ts</strong></summary>
<ul>
<li><em>API wrapper behavior:</em> Mocks underlying fetch/implementation to ensure exported API functions call correct endpoints / methods / payload transformations.</li>
<li><em>Error propagation:</em> Confirms thrown errors or rejected promises bubble appropriately for consumer hooks.</li>
</ul>
</details>

---
## Testing Philosophy

The suite focuses on:
- High‑value user flows (auth, ticket lifecycle, escalation, resolution).
- Critical component rendering & interaction (forms, dialogs, navigation).
- Validation & role-based access control.
- Minimal brittle implementation details (prefers observable behavior over internal state where possible).

Skipped / intentionally reduced:
- Exhaustive styling snapshot tests (high churn, low value).
- Redundant state permutation coverage once core logic is proven.

---
## How to Run Tests

Frontend & shared (root) tests:
```bash
npm test
```
(Uses Vitest; watch mode by default.)

Backend tests only (from `backend/` directory):
```bash
cd backend
npm test
```

Add `--run` to run once and exit:
```bash
npm test -- --run
```

Generate (optional) coverage (if configured later):
```bash
npx vitest run --coverage
```

---
## Adding New Tests
1. Prefer colocating new frontend tests under `src/test/ui` (components/pages) or `src/test/unit` (pure utilities).
2. Use existing wrappers (Providers, QueryClient) as reference from page tests.
3. For backend, add test files in `backend/src/__tests__` and reuse helpers for user/ticket creation.
4. Mock network and external services; keep logic deterministic.

---
## FAQ
<details>
<summary><strong>Why are some negative paths not duplicated?</strong></summary>
Once a validation or role guard pattern is proven in one representative test, repeating every permutation adds maintenance cost without proportional value.
</details>
<details>
<summary><strong>How do I test a new ticket mutation?</strong></summary>
Add an API-layer or component interaction test invoking the mutation, then assert on post-condition (e.g., list invalidation, toast, or DOM change). Avoid asserting internal Redux/RTK Query action sequences directly.
</details>
<details>
<summary><strong>Can we snapshot these components?</strong></summary>
We intentionally avoided snapshots due to frequent UI iteration. Prefer assertion of semantic text/roles and critical attributes.
</details>

---
If anything seems outdated or you add new modules, extend this file with new `<details>` sections mirroring the structure above. For backend changes, update the separate backend test doc: [`backend/TEST_README.md`](backend/TEST_README.md).
