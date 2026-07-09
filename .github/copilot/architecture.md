# Wyrmhort – Architecture

## 1. Project Overview

Wyrmhort is a personal hobby expense tracker for a single user. It tracks spending on collectibles (primarily Pokémon TCG) across products, item types, series, sellers, and marketplaces.

The project is intentionally scoped to one user. There is no multi-tenancy, no public registration, and no scalability requirement. Simplicity and maintainability take priority over generality.

**Tech stack:**
- Backend: Python 3.14, FastAPI, Uvicorn, Pydantic, Firebase Admin SDK
- Frontend: TypeScript, React 19, Vite, MUI, Recharts, i18next
- Platform: Google Cloud Run (backend), Firebase Hosting (frontend)
- Auth/DB: Firebase Authentication, Firestore

---

## 2. Main Responsibilities

- **Backend**: REST API that authenticates requests via Firebase ID tokens, applies a single-user email allowlist, and performs CRUD operations on expense documents in Firestore.
- **Frontend**: SPA that authenticates the user via Google Sign-In (Firebase), fetches and displays expenses from the backend API, and provides views for a data table, a pivot overview, and a pie chart.

---

## 3. High-Level Architecture

```
┌───────────────────────────────────────────────────┐
│  Browser (Firebase Hosting)                        │
│                                                   │
│  React SPA                                        │
│  ├── Firebase Auth (Google Sign-In popup)         │
│  └── fetch() → backend API (with Bearer token)   │
└───────────────┬───────────────────────────────────┘
                │ HTTPS (Bearer JWT)
┌───────────────▼───────────────────────────────────┐
│  Google Cloud Run                                  │
│                                                   │
│  FastAPI / Uvicorn                                │
│  ├── Firebase Admin SDK (token verification)      │
│  └── Firestore (expense documents)               │
└───────────────────────────────────────────────────┘
```

Authentication flow:
1. User signs in via Google popup in the browser (Firebase Auth).
2. Firebase issues a JWT ID token to the browser.
3. The browser includes this token as `Authorization: Bearer <token>` on every API request.
4. The backend verifies the token using the Firebase Admin SDK and checks the email against `ALLOWED_EMAIL`.

---

## 4. Main Modules / Directories

### Backend (`backend/src/`)

| Path | Responsibility |
|------|----------------|
| `wyrmhort.py` | Package entry point; loads `.env` and starts Uvicorn (development only – Docker does not use this). |
| `api/routes.py` | FastAPI application instance, CORS middleware, all HTTP route handlers. Routes delegate immediately to the service layer. |
| `expenses/models.py` | `Expense` domain dataclass (slots). Owns `from_firestore()` and `to_firestore()` conversion. |
| `expenses/schemas.py` | Pydantic models for API input/output (`ExpenseRequest`, `ExpenseResponse`, etc.). Handles validation, whitespace stripping, and Pokémon name autocorrection. |
| `expenses/service.py` | Business logic: sort validation, schema-to-domain mapping, orchestrates Firestore calls. |
| `firebase/auth.py` | FastAPI dependency: extracts and verifies the Bearer token, enforces the email allowlist. |
| `firebase/firestore.py` | Firestore repository: CRUD functions for expense documents. Also contains `init_firestore()` which initialises the Firebase Admin app on first call. |
| `logger_config.py` | Creates a `StreamHandler` logger with a consistent timestamped format. Every module calls `setup_logger(__name__)`. |

### Frontend (`frontend/src/`)

| Path | Responsibility |
|------|----------------|
| `main.tsx` | React app entry point, wraps in `BrowserRouter` and i18n init. |
| `App.tsx` | Root component: auth guard, routing, dark mode toggle state, demo mode banner. |
| `firebase.ts` | Initialises the Firebase client app; exports `auth` and `provider`. |
| `hooks/useAuth.ts` | Manages Firebase auth state (`onAuthStateChanged`), login, logout, and demo mode. |
| `hooks/useApiExpenses.ts` | Fetches a fresh ID token before each request; performs all CRUD API calls; manages `expenses`, `loading`, and `error` state. Handles demo mode by loading `public/demo-data.json` instead. |
| `pages/ExpensesView.tsx` | Main expense table view: filter state, pagination state, sort state, dialog open/close. |
| `pages/PivotOverview.tsx` | Grouped hierarchical summary (product → item type → series) with date range filter. |
| `pages/PieChart.tsx` | Pie chart by product (drill-down to item type) with date range filter. |
| `components/` | Presentational components: `ExpenseTable`, `ExpenseDialog`, `Pagination`, `SortIndicator`, `LoadingSpinner`, `DarkModeToggle`, `LanguageSwitch`, `Footer`, `Tabs`. |
| `types/` | Shared TypeScript types: `Expense`, `ExpenseFilters`. |
| `locales/de/`, `locales/en/` | i18n translation files. German is the default language. |
| `logger.ts` | Thin wrapper around `console.*`; suppresses `info`/`debug` in production (`import.meta.env.DEV`). |

---

## 5. Entry Points

### Backend

- **Docker / Cloud Run**: `uvicorn api.routes:app --host 0.0.0.0 --port 8080` (defined in `Dockerfile` CMD).
- **Local development**: `uv run wyrmhort` (calls `wyrmhort.py:main()`, which starts Uvicorn with `reload=True` on `127.0.0.1:8080`). Note: `reload=True` is development-only; the Docker image never uses this entry point.
- **Health check**: `GET /health` — no authentication required.

### Frontend

- **Development**: `npm run dev` → Vite dev server on port 5173.
- **Production**: `npm run build` → static assets deployed to Firebase Hosting. Vite proxies API calls via `vite.config.ts` (currently minimal config — API calls use relative paths; Firebase Hosting rewrites route them to Cloud Run).

---

## 6. Data Flow

### Read expenses (happy path)

```
Browser                    Backend                   Firestore
  │                           │                          │
  │── GET /api/expenses/ ─────►│                          │
  │   Authorization: Bearer   │                          │
  │                           │── verify_id_token()      │
  │                           │── email allowlist check  │
  │                           │── get_expenses() ────────►│
  │                           │                    query │
  │                           │◄── [Expense docs] ───────│
  │                           │── model_validate()       │
  │◄── 200 {expenses: [...]} ──│                          │
```

### Write expense (create)

```
Browser                    Backend                   Firestore
  │                           │                          │
  │── POST /api/expenses/ ────►│                          │
  │   body: ExpenseRequest     │                          │
  │                           │── validate + autocorrect │
  │                           │── _to_domain()           │
  │                           │── add_expense() ─────────►│
  │                           │                    set() │
  │                           │◄── doc_id ───────────────│
  │◄── 201 {id, message} ──────│                          │
```

### Firestore data model

Expenses are stored per-user:

```
users/{uid}/expenses/{expense_id}
  date:        string (ISO 8601)
  amount:      float
  product:     string
  item_type:   string
  series:      string
  quantity:    int
  seller:      string
  marketplace: string | null
```

---

## 7. External Dependencies and Integrations

| Dependency | Used for | Where |
|------------|----------|-------|
| Firebase Authentication | User identity (Google Sign-In); JWT issuance; token verification | frontend + backend |
| Firestore | Expense document storage | backend |
| Firebase Hosting | Serving the frontend SPA | infrastructure |
| Google Cloud Run | Running the containerised backend | infrastructure |
| Renovate | Automated dependency updates (via `drachenpapa/skeletor` shared config) | CI |
| GitHub Actions | CI/CD pipelines | `.github/workflows/` |

---

## 8. Configuration Approach

### Backend

| Source | What it provides |
|--------|-----------------|
| `backend/src/.env` (loaded by `python-dotenv`) | `ALLOWED_EMAIL` for local development |
| Environment variable `ALLOWED_EMAIL` | Email address allowed to access the API (set as GitHub Actions secret in CI, injected into Cloud Run) |
| `backend/secrets/firebase-key.json` | Firebase service account credentials. Path is resolved relative to `firebase/firestore.py` at runtime: `Path(__file__).parents[2] / "secrets" / "firebase-key.json"`. In the Docker image this resolves to `/secrets/firebase-key.json`. |

### Frontend

All runtime config is provided via Vite environment variables (`VITE_*`) injected at build time:

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase client config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase client config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase client config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase client config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase client config |
| `VITE_FIREBASE_APP_ID` | Firebase client config |
| `VITE_FIREBASE_MEASUREMENTS_ID` | Firebase client config |
| `VITE_ALLOWED_EMAIL` | Email address checked client-side to determine if the user is the owner (used for access-denied UI and to enable write actions) |

A `.env` file exists in `frontend/` for local development (not committed).

---

## 9. Error Handling Approach

### Backend

- **Validation errors**: Pydantic raises `422 Unprocessable Entity` automatically for invalid request bodies.
- **Authentication errors**: `firebase/auth.py` raises `HTTPException(401)` for missing/invalid tokens and `HTTPException(403)` for disallowed email. The original exception is suppressed (`raise ... from None`) to avoid leaking token details.
- **Firestore errors**: Each CRUD function in `firebase/firestore.py` wraps its body in `try/except Exception`, logs the error, and re-raises. The exception propagates to FastAPI's default 500 handler. No custom 500 response is defined.
- **Invalid sort field**: `service.py` logs a warning and silently falls back to `date` descending sort.

### Frontend

- API errors are caught in the `request()` wrapper in `useApiExpenses`; the error message is stored in `error` state and surfaced to components via props.
- Components render error messages inline (e.g., in table cell, below filters).
- Auth errors (login/logout) are caught and logged via `logger.error`; no user-visible error state is set.

---

## 10. Testing Approach

### Backend (`backend/tests/`)

Structure mirrors `src/`:
```
tests/
  conftest.py          # shared fixtures (sample data, mock DB, expense factory, dependency overrides)
  unit/
    api/test_routes.py      # tests route handlers in isolation (services mocked)
    expenses/test_schemas.py # Pydantic validation tests, incl. parametrized invalid inputs
    expenses/test_service.py # service logic with Firestore mocked
    firebase/test_auth.py   # token verification and email allowlist
    firebase/test_firestore.py # Firestore CRUD with mocked Firestore client
  integration/
    test_expenses_crud.py   # full HTTP stack via FastAPI TestClient with overridden dependencies
```

Key patterns:
- FastAPI's `dependency_overrides` replaces `init_firestore` and `get_current_user_uid` in all tests (set in `conftest.py` `autouse` fixture).
- `expense_factory` fixture creates typed `Expense` domain objects with optional field overrides.
- `pytest-asyncio` with `asyncio_mode = "auto"` — async test functions need no decorator.
- Coverage config in `pyproject.toml`; run via `uv run pytest`.

### Frontend (`frontend/src/`)

```
hooks/__tests__/useAuth.test.ts        # login, logout, auth state, unsubscribe
components/__tests__/Pagination.test.tsx  # UI interactions
components/__tests__/SortIndicator.test.tsx
components/__tests__/LoadingSpinner.test.tsx
test/setup.ts                          # @testing-library/jest-dom matchers
```

Runner: Vitest with jsdom. Firebase modules are mocked via `vi.mock('firebase/auth', ...)`.

**Coverage gap**: `useApiExpenses`, `ExpensesView`, `ExpenseDialog`, `PivotOverview`, and `PieChart` have no tests.

---

## 11. Important Architectural Decisions

### Single-user design
The app is explicitly single-user. Firestore data is scoped to `users/{uid}/expenses/`, but the `ALLOWED_EMAIL` allowlist at the API layer enforces that only one specific user can authenticate. This is intentional and documented in `README.md`.

### Firebase for both auth and storage
Firebase Authentication handles identity; Firestore handles persistence. The backend verifies Firebase-issued JWTs via the Admin SDK — no custom auth logic. This tightly couples the app to Firebase but eliminates significant auth complexity for a personal project.

### No server-side pagination
All filtering and sorting are applied in Firestore queries (server-side); the result set is returned in full and paginated client-side in the React state. This is appropriate given the expected data volume for a single hobby user.

### Client-side filtering in `ExpensesView`
`ExpensesView` performs additional in-memory filtering on the already-fetched expenses array. The backend also supports server-side filtering via query parameters, but `ExpensesView` does not use them — it sends only `sortKey`/`sortAsc` to the backend. The other filters (`product`, `item_type`, etc.) are applied client-side. `PivotOverview` and `PieChart` use server-side date range filtering instead.

### Demo mode
`useAuth` supports an `'demo'` auth mode stored in `localStorage`. In demo mode, `useApiExpenses` loads `public/demo-data.json` instead of calling the API. Write operations are silently blocked. This allows unauthenticated visitors to explore the UI.

### Domain model separation
The backend maintains a clean separation between the API schema layer (Pydantic `ExpenseRequest`/`ExpenseResponse`) and the domain model (`Expense` dataclass). The service layer performs the conversion via `_to_domain()`. Firestore-specific serialisation lives exclusively in `models.py`.

### Pinned action digests and image digests
All GitHub Actions and Docker base images are pinned to SHA digests, not tags. This is a deliberate supply-chain security measure.

---

## 12. Known Architectural Limitations / Technical Debt

- **`get_expenses()` uses `**kwargs`**: The Firestore repository function accepts arbitrary keyword arguments. `order_by`, `ascending`, `start_date`, and `end_date` are extracted from this dict by name. This breaks type safety and makes the interface implicit. A typed filter object would be preferable.

- **`ExpenseFilters.itemType` naming inconsistency**: The `ExpenseFilters` TypeScript interface uses `itemType` (camelCase), but the API expects `item_type` (snake_case). The `buildQueryParams` function skips `sortKey` and `sortAsc` but does not translate `itemType` → `item_type`, meaning item type filtering from the `ExpenseFilters` path is silently broken.

- **`ExpensesView` is large**: The component manages filter state (7 fields), pagination state (3 fields), sort state (2 fields), dialog state, and derived values (`uniqueProducts`, etc.) in a single component (~255 lines).

- **Duplicate `emptyExpense` constant**: Defined identically in both `ExpensesView.tsx` and `ExpenseDialog.tsx`.

- **Duplicated date-range filter UI**: `PivotOverview` and `PieChart` both contain identical date range filter markup and handler logic.

- **Frontend test coverage gap**: The core hook (`useApiExpenses`) and the main views (`ExpensesView`, `PivotOverview`, `PieChart`, `ExpenseDialog`) have no automated tests.

- **`reload=True` in `wyrmhort.py`**: The package entry point starts Uvicorn with `reload=True`. The Docker image bypasses this, but the function is misleading as a standalone entry point.

- **Firebase credentials path is file-relative**: `firebase/firestore.py` resolves the service account key path relative to its own location (`Path(__file__).parents[2] / "secrets" / "firebase-key.json"`). This works in the current Docker layout but is fragile if the module moves.

---

## 13. What Should Remain Simple

- **Backend layer count**: The current three layers (routes → service → firestore) are appropriate. Do not introduce Repository interfaces, abstract base classes, or dependency inversion containers.
- **Auth**: The single `ALLOWED_EMAIL` check is sufficient. Do not add role systems or permission models.
- **Configuration**: Environment variables loaded directly are fine. Do not introduce a settings class hierarchy or config validation framework.
- **Frontend state management**: React's built-in `useState`/`useEffect` and custom hooks are sufficient. Do not introduce Redux, Zustand, or similar global state libraries.
- **API versioning**: A single `/api/expenses/` namespace is adequate for one user and one data type.
- **Database abstraction**: There is no need to abstract Firestore behind an interface to support multiple backends.
