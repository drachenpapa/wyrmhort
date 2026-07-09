# Wyrmhort – Coding Conventions

> **Legend used in this document**
> - ✅ **Existing** – observed consistently in the codebase; follow it.
> - ⚠️ **Inconsistent** – observed in some places but not others; the recommended form is given.
> - 🔵 **Recommended** – not yet present in the codebase; proposed to fill a gap or prevent a known issue.

---

## 1. General Coding Principles

- ✅ **KISS over cleverness.** Keep code readable to a future reader unfamiliar with the surrounding context.
- ✅ **Explicit over implicit.** Prefer named variables, typed parameters, and clear control flow over shortcuts.
- ✅ **Small, focused units.** Functions and components should do one thing. If a function needs a long comment to explain what it does, it should be split.
- ✅ **No speculative code.** Do not add abstractions, parameters, or extensibility hooks for hypothetical future requirements.
- ✅ **Correct before clever.** Never optimise code that is not demonstrably a bottleneck.

---

## 2. Project Structure Conventions

### Repository layout

```
wyrmhort/
  backend/          # Python/FastAPI backend
    src/            # application source (package root for pytest)
    tests/          # mirrors src/ structure
    Dockerfile
    pyproject.toml
  frontend/         # React/TypeScript frontend
    src/
      components/   # presentational components
      hooks/        # custom React hooks
      pages/        # route-level view components
      types/        # shared TypeScript types
      locales/      # i18n JSON files (de/, en/)
    public/         # static assets (including demo-data.json)
  .github/
    actions/        # reusable composite actions
    copilot/        # AI agent instructions (this file)
    workflows/      # CI/CD pipelines
```

- ✅ Backend source lives in `backend/src/`; tests live in `backend/tests/`.
- ✅ Frontend source lives in `frontend/src/`; tests co-locate with the code they test in `__tests__/` subdirectories.
- ✅ Backend and frontend CI pipelines are fully separate (`backend-ci.yml`, `frontend-ci.yml`) and triggered by `paths:` filters.
- ✅ Reusable CI steps are extracted into composite actions under `.github/actions/`.

### Backend module layout

- ✅ `api/` – HTTP layer only (routes, middleware, FastAPI app).
- ✅ `expenses/` – domain model (`models.py`), API schemas (`schemas.py`), business logic (`service.py`).
- ✅ `firebase/` – infrastructure concerns (auth dependency, Firestore repository).
- ✅ `logger_config.py` – shared logging setup, no other logic.
- 🔵 New domain concepts get their own subdirectory following the `expenses/` pattern (models + schemas + service).

### Frontend module layout

- ✅ `pages/` – one file per route; responsible for state and data orchestration.
- ✅ `components/` – presentational components used by multiple pages; should receive all data via props.
- ✅ `hooks/` – custom hooks that encapsulate stateful logic (API calls, auth).
- ✅ `types/` – shared TypeScript type and interface definitions.
- 🔵 Do not put business logic directly in components; extract it into a hook or a utility function.

---

## 3. Naming Conventions

### Python (backend)

- ✅ `snake_case` for all variables, function names, module names, and file names.
- ✅ `PascalCase` for class names (`Expense`, `ExpenseRequest`, `ExpenseResponse`).
- ✅ `UPPER_SNAKE_CASE` for module-level constants (`ALLOWED_SORT_FIELDS`, `AUTOCORRECTIONS`).
- ✅ `_prefix` for private/internal functions (`_to_domain`).
- ✅ Suffix functions with the layer they belong to: `_service` for service functions (e.g., `create_expense_service`), no suffix for repository functions (e.g., `add_expense`).
- ✅ Test files: `test_<module>.py`. Test functions: `test_<what>_<condition_or_expected>` (e.g., `test_read_invalid_sort_field_defaults_to_date`).

### TypeScript (frontend)

- ✅ `PascalCase` for React components, type aliases, and interfaces.
- ✅ `camelCase` for variables, functions, and hook names.
- ✅ `UPPER_SNAKE_CASE` for module-level string/array constants (e.g., `COLORS`, `DEMO_MODE_INFO`).
- ✅ Hooks are prefixed with `use` (e.g., `useAuth`, `useApiExpenses`).
- ✅ Props types are named `Props` (inline) or `<ComponentName>Props` (e.g., `PaginationProps`).
- ✅ Event handlers are prefixed with `handle` (e.g., `handleSaveExpense`, `handleDeleteClick`).
- ✅ Test files: `<Subject>.test.ts(x)` inside a `__tests__/` directory adjacent to the file under test.
- ⚠️ **API field names use `snake_case`** to match the backend (`item_type`, `start_date`). TypeScript types that map directly to API payloads must use `snake_case` keys, not `camelCase`. Do not add a camelCase alias without also handling the translation in `buildQueryParams`.

### Files and directories

- ✅ Python: `snake_case` filenames (`logger_config.py`, `test_routes.py`).
- ✅ TypeScript: `PascalCase` for component files (`ExpenseTable.tsx`), `camelCase` for hooks and utilities (`useAuth.ts`, `logger.ts`).

---

## 4. Formatting and Style Conventions

### Python

- ✅ Formatter: **ruff format**. Run before committing.
- ✅ Linter: **ruff check** with rules `E, F, I, W, UP, B, SIM, RUF, PERF, C90, N`. Run before committing.
- ✅ Line length: **120 characters** (configured in `pyproject.toml`).
- ✅ Import order enforced by ruff rule `I` (isort-compatible).
- ✅ Target: Python 3.14.

### TypeScript / React

- ✅ Linter: **ESLint** with `typescript-eslint` recommended rules + `react-hooks` + `react-refresh` + `import-x/order`.
- ✅ Import order is enforced by `import-x/order`: builtin → external → internal → parent → sibling → index, alphabetically within each group, separated by blank lines.
- ✅ No separate Prettier config exists; rely on ESLint for style enforcement.
- ✅ All JSX files use the `.tsx` extension.
- ✅ Props are destructured in the function signature.
- ⚠️ Some components use `React.FC` type annotation (`LanguageSwitch`, `SortIndicator`); others use plain function declarations. **Prefer plain function declarations** (`export default function`) for page and component files. Use `React.FC` only when passing generic props to a functional component typed with `React.FC<Props>` adds value.

---

## 5. Error Handling Conventions

### Backend

- ✅ **HTTP errors**: Raise `fastapi.HTTPException` with an explicit `status_code` and a short `detail` string. Never return an error response manually.
- ✅ **Firestore errors**: Wrap each repository function body in `try/except`, log the error with `logger.error(f"Failed to {verb} expense: {e}")`, then re-raise. Let FastAPI return a default 500.
- ⚠️ Catch the most specific exception type available rather than bare `except Exception`. For Firestore calls, prefer `google.api_core.exceptions.GoogleAPIError` where applicable.
- ✅ **Auth errors**: Raise `HTTPException(401)` for token issues, `HTTPException(403)` for authorisation failures. Suppress the original exception chain (`raise ... from None`) to avoid leaking token internals.
- ✅ **Service-layer fallbacks**: Log a `logger.warning(...)` and apply a safe default (e.g., invalid sort field falls back to `date`).
- 🔵 Do not add custom exception types unless there is a concrete need to distinguish them programmatically at the call site.

### Frontend

- ✅ All API errors are caught in the `request()` wrapper in `useApiExpenses`; the error message string is stored in `error` state.
- ✅ Components receive `error: string | null` as a prop and display it inline.
- ✅ Auth lifecycle errors (login/logout failure) are caught and logged; no user-visible error state is set for these (they are non-recoverable from the UI).
- ✅ Async event handlers (e.g., `handleDeleteExpense`) catch thrown errors and log them rather than letting them propagate unhandled.
- 🔵 Never use `console.error` directly in components or hooks. Always use `logger.error(...)` from `src/logger.ts`.

---

## 6. Logging Conventions

### Backend

- ✅ Every module creates its own logger: `logger = setup_logger(__name__)` at module level.
- ✅ Log format: `[YYYY-MM-DDTHH:MM:SS] [LEVEL] [module.name] message` (defined in `logger_config.py`).
- ✅ Use `logger.info` for successful state changes (expense created/updated/deleted, Firebase app initialised).
- ✅ Use `logger.warning` for recoverable unexpected inputs (invalid sort field, disallowed email attempt).
- ✅ Use `logger.error` for caught exceptions in the repository layer.
- 🔵 Do not log sensitive data (tokens, email addresses in success paths). Email addresses may be logged in `logger.warning` for denied access attempts, which is intentional.
- 🔵 Do not add `logger.debug` calls unless actively debugging; remove them before merging.

### Frontend

- ✅ Use `logger` from `src/logger.ts`, never `console.*` directly.
- ✅ `logger.info` and `logger.debug` are suppressed in production (`import.meta.env.DEV` guard).
- ✅ `logger.warn` and `logger.error` are always active (production-visible).
- ✅ Use `logger.info("User detected", user)` style: a string message followed by a structured value.
- 🔵 Do not use `console.log` anywhere in the application code. (One existing instance in `useApiExpenses` for the demo-mode guard should be `logger.warn`.)

---

## 7. Testing Conventions

### Backend

- ✅ Runner: **pytest** via `uv run pytest`.
- ✅ Async tests use `pytest-asyncio` with `asyncio_mode = "auto"` — no `@pytest.mark.asyncio` decorator needed.
- ✅ All shared fixtures live in `conftest.py`; test-local fixtures live in the test file.
- ✅ The `expense_factory` fixture accepts an `overrides: dict` to create variations without repeating defaults.
- ✅ FastAPI dependency overrides (`app.dependency_overrides`) are used to inject mock DB and auth; cleared after each test via `yield` + `app.dependency_overrides.clear()`.
- ✅ Service-layer tests mock the Firestore layer (`mocker.patch("expenses.service.add_expense")`); they do not call real Firestore.
- ✅ Route-layer tests mock the service layer; they test HTTP semantics only.
- ✅ Firestore-layer tests construct a mock Firestore chain and test persistence mechanics.
- ✅ Use `pytest.mark.parametrize` for validation edge cases (see `test_schemas.py`).
- 🔵 Integration tests (in `tests/integration/`) use `TestClient` and test the full HTTP stack with mocked Firestore. Keep them focused on HTTP contract, not business logic.
- 🔵 Target: each new function in `expenses/`, `firebase/`, or `api/` should have a corresponding unit test. At minimum: happy path + one error/edge case.

### Frontend

- ✅ Runner: **Vitest** via `npm test`.
- ✅ Test environment: `jsdom` (configured in `vitest.config.ts`).
- ✅ Setup file: `src/test/setup.ts` imports `@testing-library/jest-dom` matchers.
- ✅ Firebase modules are mocked with `vi.mock('firebase/auth', async () => { ... })`.
- ✅ Tests for UI components use `@testing-library/react` (`render`, `screen`, `fireEvent`).
- ✅ Tests for hooks use `renderHook` + `act` from `@testing-library/react`.
- 🔵 New hooks must have a `__tests__/<HookName>.test.ts` file covering: initial state, the primary happy-path action, and error state.
- 🔵 New components that contain conditional rendering or user interactions must have a test covering each branch.
- 🔵 Mock `fetch` for `useApiExpenses` tests using `vi.stubGlobal('fetch', ...)` or a test-local mock.

---

## 8. Dependency Conventions

### General

- ✅ Dependencies are managed automatically by **Renovate** (configuration in `.github/renovate.json`, extending `drachenpapa/skeletor`). Do not manually bump dependency versions.
- ✅ All GitHub Actions steps are pinned to **SHA digests**, not tag names. When adding a new action, use a pinned digest.
- ✅ The Docker base image (`python:3.14-slim`) is pinned to a **SHA digest**. Update via Renovate, not manually.

### Backend

- ✅ Package manager: **uv** with `uv.lock` for reproducible installs.
- ✅ Runtime dependencies go in `[project.dependencies]` in `pyproject.toml`.
- ✅ Dev-only tools (linters, test runners, type checkers) go in `[project.optional-dependencies] dev`.
- ✅ CI-only tools (SBOM, pip-audit) go in `[project.optional-dependencies] ci`.
- 🔵 Before adding a new runtime dependency, verify there is no standard-library equivalent. The current runtime dependency count is intentionally small (FastAPI, firebase-admin, uvicorn).

### Frontend

- ✅ Package manager: **npm** with `package-lock.json`.
- ✅ Runtime dependencies go in `dependencies`; tooling goes in `devDependencies`.
- ✅ Overrides (in `package.json` `"overrides"`) are used to pin transitive dependencies with known CVEs. Document why each override exists in a comment or commit message.
- 🔵 Before adding a new dependency, check if the standard library or an already-installed dependency covers the use case.

---

## 9. Configuration Conventions

### Backend

- ✅ Runtime secrets and environment-specific values are provided via **environment variables**.
- ✅ For local development, variables are loaded from `backend/src/.env` via `python-dotenv` in `wyrmhort.py`. The `.env` file is not committed.
- ✅ The Firebase service account key is stored at `backend/secrets/firebase-key.json`. The `secrets/` directory is not committed and is injected at build/deploy time.
- 🔵 Do not hardcode environment-specific values (URLs, paths, email addresses) in application source. Read them from environment variables.

### Frontend

- ✅ All build-time configuration uses **Vite environment variables** (`VITE_*` prefix).
- ✅ Variables are defined in `frontend/.env` locally and as GitHub Actions / Firebase Hosting secrets in CI. The `.env` file is not committed.
- ✅ Access environment variables via `import.meta.env.VITE_*`; never use `process.env` in frontend code.
- 🔵 Do not add new environment variables without also documenting them in this file and in the CI workflow that uses them.

---

## 10. Documentation Conventions

- ✅ **Docstrings** are used selectively: on public functions where the purpose is not immediately obvious from the signature (`from_firestore`, `to_firestore`, service functions, Pydantic model classes).
- ✅ Docstrings follow the one-line summary style. Multi-line docstrings use `Attributes:` blocks where fields need explanation.
- ✅ **Inline comments** are used for non-obvious logic only. Do not comment code that reads naturally.
- ✅ All user-facing strings go through **i18n** (`useTranslation` / `t(key)`). Do not hardcode display text in JSX.
- ✅ Both `de` and `en` translation files must be updated together when a new translation key is added.
- 🔵 Translation keys use `snake_case` and describe the semantic meaning, not the content (e.g., `"error_loading_data"`, not `"could_not_load"`).
- 🔵 `README.md` documents the tech stack and purpose. It does not need implementation detail; that lives in `architecture.md` and `conventions.md`.

---

## 11. Language-Specific Conventions

### Python

- ✅ Use `from __future__ import annotations` only if needed for forward references; it is not currently used and should not be added speculatively.
- ✅ Use `@dataclass(slots=True)` for immutable domain objects (see `Expense`).
- ✅ Use `Final` for constants that must not be reassigned at runtime (e.g., `ALLOWED_SORT_FIELDS`).
- ✅ Use `Annotated[T, Field(...)]` for Pydantic fields rather than `Field()` as a default value.
- ✅ Use `model_config = ConfigDict(...)` instead of `class Config` (Pydantic v2 style).
- ✅ Type annotations on all function signatures. `mypy` is run in CI.
- ✅ Use `str | None` (union syntax) instead of `Optional[str]`.
- ✅ Use f-strings for all string formatting. Do not use `%` formatting or `.format()`.
- 🔵 Do not use `**kwargs` for typed internal function signatures. Use explicit parameters or a typed dataclass instead.

### TypeScript / React

- ✅ Use `type` for simple object shapes and union types. Use `interface` for shapes that describe a named concept or may be extended (currently both are used; either is acceptable).
- ✅ All state typed explicitly: `useState<Expense[]>([])`, not `useState([])`.
- ✅ Avoid `any`. Use `unknown` for values of unknown type and narrow before use.
- ✅ Async functions that return a `Promise` that is not awaited at the call site are prefixed with `void`: `void fetchExpenses(...)`.
- ✅ `useCallback` is used for functions passed as props or used as `useEffect` dependencies.
- ✅ `useMemo` is used for derived values that are computationally non-trivial or used as `useEffect` dependencies.
- ✅ `React.memo` is used for components that receive stable props and are rendered frequently (e.g., `SortIndicator`).
- ✅ Boolean props that control rendering are expressed as conditions: `disabled={authMode === 'demo'}`, not a derived `isDemo` boolean unless it is reused.

---

## 12. Framework-Specific Conventions

### FastAPI (backend)

- ✅ Route handlers are `async def`. They delegate immediately to a service function and return a typed response model. No business logic lives in route handlers.
- ✅ Dependencies (`DB`, `CurrentUser`) are declared as `Annotated` type aliases at module level in `routes.py` for readability.
- ✅ Response models are declared explicitly on each route decorator (`response_model=...`). Do not rely on FastAPI's implicit serialisation.
- ✅ All routes include a `tags=[...]` argument for OpenAPI grouping.
- ✅ Route docstrings appear in the OpenAPI UI; keep them short and descriptive.
- 🔵 Do not add business logic or Firestore calls directly in route handlers. Route → Service → Repository is the mandatory flow.

### React (frontend)

- ✅ All components are function components. No class components.
- ✅ Page components (`pages/`) own state and call hooks. They pass data to presentational components via props.
- ✅ Presentational components (`components/`) receive all data via props. They do not call `useApiExpenses` or `useAuth` directly.
- ✅ The `key` prop for lists uses a stable, unique identifier (e.g., `exp.id`, field value). Index-as-key is acceptable only for static, reorder-proof lists (e.g., pagination size options).
- ✅ Form submissions use `onSubmit={e => e.preventDefault()}` with a separate `onClick` on the submit button; native form submission is not used.
- ✅ All visible text is wrapped in `t(key)` from `useTranslation`. Hardcoded English strings in JSX are not permitted.
- ✅ `authMode` is threaded as a prop to components that need to disable write actions in demo mode. Components check `authMode === 'demo'` to set `disabled` on write buttons.

### i18n

- ✅ Default language: German (`lng: 'de'`). English (`en`) is the fallback.
- ✅ Translation keys are added to both `locales/de/translation.json` and `locales/en/translation.json` simultaneously.
- ✅ Interpolation uses `{{variableName}}` syntax (e.g., `"greeting": "Hi, {{name}}!"`).
- 🔵 Do not use `t()` outside of React components or hooks. Translation is available only after `i18n.init()` completes.

---

## 13. Things to Avoid

### Architecture

- ❌ **Do not add extra architectural layers** (Repository interfaces, Service interfaces, abstract base classes). The current three-layer backend is sufficient.
- ❌ **Do not add global state management** (Redux, Zustand, Jotai) to the frontend. React's built-in state and custom hooks are sufficient for this project's scope.
- ❌ **Do not add a second database or caching layer**. Firestore is the only data store.
- ❌ **Do not add multi-user or role-based access control**. The project is single-user by design.

### Code

- ❌ **Do not use `**kwargs` in typed internal function signatures**. It defeats type checking and makes call sites ambiguous.
- ❌ **Do not define the same constant in multiple files** (e.g., `emptyExpense`). Extract shared values to a common module.
- ❌ **Do not hardcode locale or currency** (`'de-DE'`, `'EUR'`) directly in components. Use a shared formatting utility.
- ❌ **Do not use `console.log` / `console.error` directly**. Use `logger` from `src/logger.ts` (frontend) or `setup_logger(__name__)` (backend).
- ❌ **Do not add `reload=True`** to any Uvicorn startup outside of explicit local-dev tooling.
- ❌ **Do not suppress exception chains with `from None`** unless there is a specific, documented reason to hide the original error (currently used only in auth to avoid token leakage, which is intentional).

### Dependencies

- ❌ **Do not bump dependency versions manually**. Renovate handles this.
- ❌ **Do not add a new runtime dependency** without confirming the standard library or an existing dependency cannot solve the problem.
- ❌ **Do not use unpinned action tags** (e.g., `actions/checkout@v4`) in workflows. Use SHA digests.

### Testing

- ❌ **Do not test implementation details** (private function internals, exact intermediate values). Test observable behaviour and public API contracts.
- ❌ **Do not write tests that depend on execution order**. Each test must be independently runnable.
- ❌ **Do not call real Firebase or Firestore** in tests. All external services are mocked.
