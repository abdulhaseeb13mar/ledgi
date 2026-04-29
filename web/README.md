# Ledgi

Ledgi is a React + Firebase web app for tracking money owed between people. A signed-in user can add friends, create dues against one or more friends, see what they owe, see what others owe them, request that a due be marked paid, and confirm or reject those resolution requests.

This README is intentionally written as an AI-first repository guide. It is not a marketing page. The goal is to give another engineer or another AI model enough context to understand how the project works, where logic lives, how data moves through the system, and which files should be treated as the main sources of truth.

The same codebase supports two branded builds:

- `Ledgi`
- `Kamel Hisaab`

The branding switch is controlled by environment and build scripts, while the application logic is shared.

## Table of Contents

1. [AI Quick Context](#ai-quick-context)
2. [Product Overview](#product-overview)
3. [Technology Stack](#technology-stack)
4. [Getting Started](#getting-started)
5. [Environment Variables and Multi-App Setup](#environment-variables-and-multi-app-setup)
6. [Scripts and Operational Commands](#scripts-and-operational-commands)
7. [Deployment Model](#deployment-model)
8. [Repository Map](#repository-map)
9. [Runtime Architecture](#runtime-architecture)
10. [Route Map](#route-map)
11. [State and Data Flow](#state-and-data-flow)
12. [Domain Model](#domain-model)
13. [Firestore Data Access Layer](#firestore-data-access-layer)
14. [Feature Flows](#feature-flows)
15. [UI Composition](#ui-composition)
16. [Change Guide](#change-guide)
17. [Constraints, Assumptions, and Risks](#constraints-assumptions-and-risks)
18. [Known Inconsistencies to Check](#known-inconsistencies-to-check)
19. [Glossary](#glossary)

## AI Quick Context

If you only need the minimum mental model before editing the project, start here.

- Entry point: `src/main.tsx`
- Root routed app shell: `src/App.tsx`
- Route tree: `src/routes/index.tsx`
- Firebase initialization: `src/lib/firebase.ts`
- Auth state and current app user loading: `src/providers/auth.provider.tsx`
- React Query client: `src/providers/query.provider.tsx`
- Firestore CRUD and domain operations: `src/services/firestore.ts`
- Dues queries and mutations: `src/hooks/api/dues.ts`
- Friend queries and mutations: `src/hooks/api/friends.ts`
- User queries and preference mutations: `src/hooks/api/users.ts`
- Query-key ownership: `src/hooks/api/query-keys.ts`
- Main domain types: `src/types/*.ts`
- Firestore authorization and data invariants: `firestore.rules`

High-level behavior:

- The app is fully client-side.
- Authentication uses Firebase Auth.
- Business data is stored in Firestore.
- The UI reads and mutates data through a thin service layer plus React Query hooks.
- Routing uses TanStack Router with auth guards in route `beforeLoad` hooks.
- The app has no backend server in this repo.
- The app has no automated tests in this repo at the time of writing.
- The main quality gate currently available in `package.json` is ESLint.

If you need to change a common behavior, start here:

| Change goal                          | Start with                                             |
| ------------------------------------ | ------------------------------------------------------ |
| Add or change a route                | `src/routes/index.tsx`                                 |
| Change page-level behavior           | `src/pages/<feature>/index.tsx`                        |
| Change auth/session behavior         | `src/providers/auth.provider.tsx`                      |
| Change Firestore reads/writes        | `src/services/firestore.ts`                            |
| Change query caching or invalidation | `src/hooks/api/*.ts` and `src/hooks/api/query-keys.ts` |
| Change Firebase config               | `src/lib/firebase.ts`, `.env.example`, `.env.*`        |
| Change branding or app title/favicon | `scripts/set-app-config.mjs`, `index.html`, `public/`  |
| Change deploy target behavior        | `.firebaserc`, `firebase.json`, `package.json`         |

## Product Overview

The application models simple personal ledger relationships between users.

Core user capabilities:

- Register and log in with email/password.
- Create dues where the current user is the creator and one or more other users are the debtors.
- See aggregated totals for:
  - money the current user owes
  - money others owe the current user
- Browse dues grouped by relationship.
- Request that dues be resolved after payment.
- Confirm or reject resolution requests.
- Manage a friends list.
- Update a preferred currency setting.

Important domain framing:

- A `creator` is the user who created the due and is owed money.
- An `ower` is the user who owes money.
- A `due` is a single debt record between one creator and one ower.
- A single "create due" action can create multiple `due` documents if the creator enters multiple debtors.
- The app supports multiple currencies, and dashboard totals are grouped by currency instead of being converted.

Branding model:

- `Ledgi` and `Kamel Hisaab` are two branded deployments from the same repository.
- The core source code is shared.
- Build-time environment selection and a script-driven `index.html` rewrite control app title, favicon, and loader assets.

## Technology Stack

Frontend:

- React 19
- TypeScript
- Vite
- TanStack Router
- TanStack React Query

Backend-as-a-service:

- Firebase Auth
- Cloud Firestore
- Firebase Hosting

UI and styling:

- Tailwind CSS
- Radix-based UI primitives in `src/components/ui`
- `lucide-react` for icons
- `sonner` for toast notifications

Other notable packages:

- `lodash.debounce` for debounced search input
- `vite-plugin-svgr` for SVG imports as React components
- `next-themes` is installed, though theme behavior is not central to the main product flow

## Getting Started

### Prerequisites

- Node.js
- pnpm
- Firebase project access for the target environments if you need to run against real backend data

### Install

```bash
pnpm install
```

### Create environment files

The repository includes `.env.example` with the required variables. Create two environment files from it:

- `.env.ledgi`
- `.env.kamelhisaab`

Required variables:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_APP_TYPE=
```

`VITE_APP_TYPE` is expected to align with the selected brand mode.

### Run locally

Default dev server:

```bash
pnpm run dev
```

Brand-specific dev servers:

```bash
pnpm run dev:ledgi
pnpm run dev:kamelhisaab
```

The default `dev` command starts plain Vite without a brand-specific mode. If you need exact branding behavior locally, prefer one of the explicit app-mode commands.

## Environment Variables and Multi-App Setup

### Environment contract

TypeScript declares the expected Vite environment variables in `src/vite-env.d.ts`.

Variables used by the app:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_APP_TYPE`

### Firebase initialization

`src/lib/firebase.ts` initializes the Firebase app once and exports:

- `auth`
- `db`

There is no custom backend adapter in the repo. Most backend-facing logic goes straight from React code to the Firebase SDK through the service layer in `src/services/firestore.ts`.

### Brand switching

The repository supports two app identities.

- `ledgi`
- `kamel-hisaab`

The script `scripts/set-app-config.mjs` rewrites `index.html` before a production build so the output has the correct:

- `<title>`
- favicon
- loader image source
- loader image class

Configured values in the script:

| App type       | Title          | Favicon                      | Loader asset                |
| -------------- | -------------- | ---------------------------- | --------------------------- |
| `ledgi`        | `Ledgi`        | `/khaata-logo.svg`           | `/khaata-logo.svg`          |
| `kamel-hisaab` | `Kamel Hisaab` | `/kamel-hisaab-app-logo.svg` | `/kamel-hisaab-primary.svg` |

Note the naming difference between CLI build arguments and Vite modes:

- Build script argument: `kamel-hisaab`
- Vite mode: `kamelhisaab`

That distinction is intentional in the current scripts and should be preserved unless the whole build contract is cleaned up consistently.

## Scripts and Operational Commands

Source of truth: `package.json`

| Command                       | Meaning                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm run dev`                | Start Vite dev server without an explicit app mode                                                        |
| `pnpm run dev:ledgi`          | Start Vite in `ledgi` mode                                                                                |
| `pnpm run dev:kamelhisaab`    | Start Vite in `kamelhisaab` mode                                                                          |
| `pnpm run build:ledgi`        | Rewrite `index.html` for Ledgi, run TypeScript build, then build Vite output in `ledgi` mode              |
| `pnpm run build:kamelhisaab`  | Rewrite `index.html` for Kamel Hisaab, run TypeScript build, then build Vite output in `kamelhisaab` mode |
| `pnpm run lint`               | Run ESLint across the repository                                                                          |
| `pnpm run preview`            | Preview the production build locally                                                                      |
| `pnpm run deploy-ledgi`       | Build Ledgi and deploy with the default Firebase project                                                  |
| `pnpm run deploy-kamelhisaab` | Build Kamel Hisaab, switch Firebase target, then deploy                                                   |

Operational notes:

- There is no dedicated test command in `package.json`.
- Production builds depend on the pre-build HTML rewrite step.
- Deploy commands assume the Firebase CLI is installed and the user is authenticated.

## Deployment Model

### Firebase project mapping

`.firebaserc` defines the current project aliases:

| Alias         | Firebase project |
| ------------- | ---------------- |
| `default`     | `khaata-ledger`  |
| `kamelhisaab` | `kamel-hisaab`   |

### Hosting behavior

`firebase.json` configures Firebase Hosting to serve the built SPA from `dist/` and rewrite all routes to `index.html`.

Implications:

- This is a client-side routed application.
- Deep links are expected to resolve through the SPA rewrite.
- There is no server-side rendering path in this repo.

### Deploy flow summary

Ledgi deployment:

```bash
pnpm run deploy-ledgi
```

Kamel Hisaab deployment:

```bash
pnpm run deploy-kamelhisaab
```

The Kamel Hisaab deployment explicitly switches Firebase project before running `firebase deploy`. The Ledgi deployment relies on the default Firebase project configured in `.firebaserc`.

## Repository Map

This section explains folder responsibility rather than just listing names.

### Top-level files

| Path                         | Responsibility                                                   |
| ---------------------------- | ---------------------------------------------------------------- |
| `README.md`                  | This architecture and onboarding document                        |
| `package.json`               | Scripts and dependency manifest                                  |
| `vite.config.ts`             | Vite build configuration                                         |
| `tsconfig*.json`             | TypeScript project configuration                                 |
| `eslint.config.js`           | ESLint rules                                                     |
| `firebase.json`              | Firebase Hosting config                                          |
| `.firebaserc`                | Firebase project alias mapping                                   |
| `firestore.rules`            | Firestore security and state-transition rules                    |
| `index.html`                 | Base HTML shell that is rewritten at build time for brand assets |
| `scripts/set-app-config.mjs` | Build-time brand customization script                            |
| `components.json`            | UI/component tooling config                                      |

### `src/` responsibilities

| Path                          | Responsibility                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `src/main.tsx`                | App bootstrap, provider composition, boot loader removal                            |
| `src/App.tsx`                 | Root routed app shell with router loading UI, Suspense fallback, and global toaster |
| `src/router.tsx`              | Simple re-export of the router definition                                           |
| `src/routes/`                 | Route tree definition and navigation ownership                                      |
| `src/layouts/`                | Page shells and auth-protected layout composition                                   |
| `src/pages/`                  | Route-level screens and feature flow orchestration                                  |
| `src/components/`             | Reusable UI pieces used by pages/layouts                                            |
| `src/components/ui/`          | Lower-level UI primitives                                                           |
| `src/hooks/use-auth.ts`       | Thin re-export for consuming auth context                                           |
| `src/hooks/api/`              | React Query hooks wrapping Firestore service functions                              |
| `src/hooks/api/query-keys.ts` | Canonical cache key definitions                                                     |
| `src/providers/`              | Global React context and query client wiring                                        |
| `src/services/`               | Firestore access functions and domain operations                                    |
| `src/lib/`                    | Shared library setup such as Firebase initialization                                |
| `src/types/`                  | Domain types for users, dues, and currencies                                        |
| `src/utils/`                  | Formatting and small reusable helpers                                               |
| `src/constants/`              | Shared constants such as regex and asset references                                 |
| `src/assets/`                 | Static assets imported into the app                                                 |

### Pages by feature area

| Path                               | Main role                                                         |
| ---------------------------------- | ----------------------------------------------------------------- |
| `src/pages/login`                  | Email/password login                                              |
| `src/pages/register`               | Account creation                                                  |
| `src/pages/forgot-password`        | Password reset flow                                               |
| `src/pages/dashboard`              | Summary view and feature entry points                             |
| `src/pages/create-due`             | Create one or more due records                                    |
| `src/pages/dues-owed`              | List people the current user owes                                 |
| `src/pages/dues-owed-detail`       | Detailed dues owed to a specific creator; request resolution      |
| `src/pages/dues-receivable`        | List people who owe the current user                              |
| `src/pages/dues-receivable-detail` | Detailed dues a specific ower owes; confirm/reject resolution     |
| `src/pages/confirm-dues`           | Pending resolution requests waiting for current user confirmation |
| `src/pages/pending-dues`           | Resolution requests initiated by current user and awaiting others |
| `src/pages/friends`                | Friend management                                                 |
| `src/pages/settings`               | User settings such as preferred currency                          |

## Runtime Architecture

### App bootstrap

`src/main.tsx` does the following in order:

1. Imports global CSS.
2. Builds the React root.
3. Watches the root element to hide and remove the boot loader once the first app frame renders.
4. Wraps the app in these providers:
   - `QueryClientProvider`
   - `AuthProvider`
   - `RouterProvider`

That order matters:

- React Query must be available before hooks are used inside routed pages.
- Auth context must exist before auth-gated pages and layouts rely on it.
- Router sits inside those providers so route components can use both.

### Root app shell

`src/App.tsx` is the root routed component used by the TanStack Router root route.

It is responsible for:

- showing a full-screen overlay spinner during soft navigations when router state is `pending`
- wrapping routed content in `Suspense`
- rendering a centered fallback spinner while lazy pages load
- mounting the global `Toaster`

This means navigation feedback and toast infrastructure are centralized at the app shell level rather than repeated across pages.

### Router ownership

The canonical route tree lives in `src/routes/index.tsx`.

Important design choices:

- Pages are lazy-loaded with `React.lazy`.
- Routing uses a root route plus two layout routes.
- Auth rules are enforced in route `beforeLoad` hooks.

Guard functions:

- `requireAuth()` redirects unauthenticated users to `/login`.
- `redirectIfAuthed()` redirects authenticated users away from auth pages to `/`.

### Layout model

The router splits the app into two major layout branches.

| Layout            | Purpose                                                                            |
| ----------------- | ---------------------------------------------------------------------------------- |
| `AuthLayout`      | Centered auth-page wrapper on the blue full-screen background                      |
| `DashboardLayout` | Signed-in shell with `HamburgerMenu`, max-width container, and padded main content |

`ScrollablePageLayout` is a reusable page shell used by several form/detail pages to standardize a `PageHeader`, scrollable body content, and optional bottom actions.

### Auth model

`src/providers/auth.provider.tsx` owns application-level auth state.

It stores:

- `user`: Firebase Auth user
- `appUser`: Firestore user profile document
- `loading`: whether auth/profile loading is still in progress
- `refreshAppUser()`: manual profile refresh helper

Behavior:

- Subscribes to `onAuthStateChanged(auth, ...)`
- Updates the Firebase user in React state
- Fetches the Firestore user profile with `getUserById()` when signed in
- Clears `appUser` when signed out

This is important: the app distinguishes between the Firebase Auth user and the Firestore app profile document.

### Query model

`src/providers/query.provider.tsx` creates a single React Query client.

Current default:

- `staleTime: 60 * 1000`

Consequences:

- Data is treated as fresh for 60 seconds unless explicitly invalidated.
- Mutation hooks rely on query invalidation rather than real-time Firestore listeners.
- Cross-device or cross-user changes may not appear immediately if they are not followed by an invalidation path.

Current invalidation pattern in hooks:

- dues mutations invalidate `duesKeys.all`
- friend add/remove mutations invalidate `friendsKeys.list(userId)`
- currency updates invalidate `usersKeys.detail(uid)`

The settings page then calls `refreshAppUser()` so the auth context's cached Firestore profile matches the updated user preference immediately.

## Route Map

Canonical source: `src/routes/index.tsx`

### Auth routes

| Path               | Component            | Access rule                              |
| ------------------ | -------------------- | ---------------------------------------- |
| `/login`           | `LoginPage`          | Redirect to `/` if already authenticated |
| `/register`        | `RegisterPage`       | Redirect to `/` if already authenticated |
| `/forgot-password` | `ForgotPasswordPage` | Redirect to `/` if already authenticated |

### Authenticated app routes

| Path                       | Component                  | Access rule   |
| -------------------------- | -------------------------- | ------------- |
| `/`                        | `DashboardPage`            | Requires auth |
| `/dues/create`             | `CreateDuePage`            | Requires auth |
| `/dues/owed`               | `DuesOwedPage`             | Requires auth |
| `/dues/owed/$userId`       | `DuesOwedDetailPage`       | Requires auth |
| `/dues/receivable`         | `DuesReceivablePage`       | Requires auth |
| `/dues/receivable/$userId` | `DuesReceivableDetailPage` | Requires auth |
| `/dues/confirm`            | `ConfirmDuesPage`          | Requires auth |
| `/dues/pending`            | `PendingDuesPage`          | Requires auth |
| `/settings`                | `SettingsPage`             | Requires auth |
| `/friends`                 | `FriendsPage`              | Requires auth |

## State and Data Flow

This is the main path from UI to storage.

1. A route renders a page from `src/pages/`.
2. The page calls React Query hooks from `src/hooks/api/`.
3. The hooks delegate reads and writes to `src/services/firestore.ts`.
4. The service layer talks directly to Firestore through the Firebase SDK.
5. Auth state is read from `AuthProvider` when needed.
6. On successful mutations, hooks invalidate relevant query keys so pages refetch.

This architecture keeps pages relatively thin while avoiding direct Firestore SDK usage inside most UI files.

### Query key strategy

`src/hooks/api/query-keys.ts` defines structured query keys.

Why it matters:

- It gives consistent cache identity.
- It makes mutation invalidation predictable.
- It avoids ad hoc string keys scattered through pages.

Important groups:

- dues keys: all dues, dues I owe, dues owed to me, pair-specific detail queries, pending confirmation queues
- user keys: search results, user detail, batched user lookups by IDs
- friend keys: friend list and exact email search

### Service layer strategy

`src/services/firestore.ts` is not a generic repository abstraction. It is a small, domain-specific API surface for the app.

Examples:

- `createUser()`
- `getUserById()`
- `searchUsers()`
- `createDues()`
- `getDuesIOwe()`
- `requestResolve()`
- `confirmResolve()`
- `addFriend()`
- `removeFriend()`

## Domain Model

### AppUser

Defined in `src/types/user.types.ts`.

Represents the Firestore-backed user profile associated with a Firebase Auth account.

Fields:

- `uid`
- `name`
- `email`
- `emailLowercase`
- `createdAt`
- `preferredCurrency?`

Notes:

- Email is stored in both original and lowercase form.
- Lowercase email supports case-insensitive search.
- Preferred currency is used to seed user-level currency behavior in the UI.

### Due

Defined in `src/types/due.types.ts`.

A `Due` is a single debt document between exactly two users.

Fields:

- `id`
- `creatorId`
- `owerId`
- `amount`
- `currency?`
- `description`
- `status`
- `createdAt`
- `resolveRequestedAt`

### Due status lifecycle

Current statuses used in the app:

- `active`
- `resolve_requested`
- `resolved`

Open dues in most user-facing queries are filtered to:

- `active`
- `resolve_requested`

Resolution lifecycle:

```text
active -> resolve_requested -> resolved
                     \-> active
```

Meaning:

- `active`: default state after creation
- `resolve_requested`: the ower says the due has been settled and requests confirmation
- `resolved`: the creator confirms the due is settled
- `resolve_requested -> active`: the creator rejects the resolution request

### Friends

Friends are stored as documents in a user-specific subcollection:

```text
users/{userId}/friends/{friendUid}
```

The friend record itself is minimal. The app later resolves those IDs into full user documents.

### Currency model

Currency definitions live in `src/types/currency.types.ts`.

Current facts from code:

- `CURRENCIES` contains 20 hardcoded currency definitions.
- `DEFAULT_CURRENCY` is `PKR`.
- Each currency entry contains `code`, `symbol`, and `name`.

The app does not do exchange-rate conversion. Amounts are grouped and displayed per currency. This is why dashboard summaries can show multiple totals instead of a single normalized number.

## Firestore Data Access Layer

Source of truth: `src/services/firestore.ts`

### Users

Key functions:

- `createUser(uid, name, email)`
- `updateUserCurrency(uid, currency)`
- `getUserById(uid)`
- `getUsersByIds(uids)`
- `searchUsers(searchQuery, currentUserId)`
- `searchUserByEmail(email, currentUserId)`

Notable behaviors:

- `createUser()` creates a profile document after authentication succeeds.
- `searchUsers()` does prefix search over both lowercase email and name.
- `getUsersByIds()` batches `in` queries in chunks of 30 because of Firestore limits.

### Dues

Key functions:

- `createDues(creatorId, entries, description, currency)`
- `getDuesIOwe(userId)`
- `getDuesOwedToMe(userId)`
- `getDuesIOweToUser(myId, creatorId)`
- `getDuesUserOwesToMe(myId, owerId)`
- `requestResolve(dueIds)`
- `confirmResolve(dueIds)`
- `rejectResolve(dueIds)`
- `getDuesPendingMyConfirmation(userId)`
- `getDuesPendingOthersConfirmation(userId)`

Notable behaviors:

- `createDues()` creates multiple due documents in a Firestore write batch.
- Read functions fetch broad sets by `creatorId` or `owerId`, then apply some filtering client-side.
- Dues are sorted newest-first by `createdAt`.
- Resolution changes are modeled as batch updates on `status` and `resolveRequestedAt`.

### Friends

Key functions:

- `addFriend(currentUserId, friendUid)`
- `removeFriend(currentUserId, friendUid)`
- `getFriendIds(currentUserId)`

The friends query flow is split:

1. Load friend document IDs from the subcollection.
2. Fetch full user records for those IDs.

That second step is implemented in the React Query layer in `src/hooks/api/friends.ts`.

## Feature Flows

### 1. Registration and login

Main files:

- `src/pages/register/index.tsx`
- `src/pages/login/index.tsx`
- `src/providers/auth.provider.tsx`
- `src/services/firestore.ts`

Conceptual flow:

1. User registers with Firebase Auth.
2. App creates a Firestore user profile via `createUser()`.
3. `AuthProvider` receives the auth-state change.
4. `AuthProvider` loads the Firestore profile into `appUser`.
5. Auth routes redirect away from login/register once authenticated.

### 2. Dashboard totals and entry points

Main file:

- `src/pages/dashboard/index.tsx`

The dashboard is the best compact example of the app's page architecture.

It:

- reads the current auth user from `useAuthContext()`
- fetches dues the user owes
- fetches dues owed to the user
- fetches pending confirmations in both directions
- groups open dues by currency
- shows badge counts for pending confirmations
- renders navigation actions into the rest of the app

This page is useful when you want to understand how auth state, query hooks, domain utilities, and navigation all fit together.

### 3. Creating dues

Main file:

- `src/pages/create-due/index.tsx`

Conceptual behavior:

1. User selects or searches other users.
2. User enters amount information and description.
3. Page calls the create-due mutation hook.
4. Mutation delegates to `createDues()` in the Firestore service layer.
5. The service writes one due document per selected ower.
6. Dues queries are invalidated after success.

Important implementation details from `src/pages/create-due/index.tsx`:

- The starting currency defaults to `appUser?.preferredCurrency ?? DEFAULT_CURRENCY`.
- The page stores one global amount input and a per-user amount map.
- "Apply to all" copies the current global amount into each selected user's amount field.
- Submission is blocked if description is blank, no users are selected, or any amount is `<= 0`.
- Successful submission navigates back to `/`.

### 4. Browsing dues the user owes

Main files:

- `src/pages/dues-owed/index.tsx`
- `src/pages/dues-owed-detail/index.tsx`

Purpose:

- show open dues where current user is the `ower`
- drill into a specific relationship
- request resolution of selected dues

### 5. Browsing dues owed to the user

Main files:

- `src/pages/dues-receivable/index.tsx`
- `src/pages/dues-receivable-detail/index.tsx`

Purpose:

- show open dues where current user is the `creator`
- drill into a specific ower relationship
- confirm or reject resolution requests

### 6. Pending resolution queues

Main files:

- `src/pages/confirm-dues/index.tsx`
- `src/pages/pending-dues/index.tsx`

There are two different pending concepts:

- dues awaiting the current user's confirmation as creator
- dues for which the current user already requested confirmation and is waiting on others

Those are modeled as separate queries and separate pages.

### 7. Friend management

Main files:

- `src/pages/friends/index.tsx`
- `src/components/UserSearchInput.tsx`
- `src/hooks/api/friends.ts`

Important behavior:

- the dedicated friends page performs debounced email search
- `UserSearchInput` used in due creation performs debounced search and merges local friend matches, exact email lookup, and broader user search results
- users can be added as friends inline from the due-creation search UI
- friend IDs are stored separately from full user profiles

### 8. Settings and preferred currency

Main file:

- `src/pages/settings/index.tsx`

The settings flow updates user-level preferences, especially preferred currency, through the Firestore service layer.

Important implementation details:

- The dropdown defaults to `appUser?.preferredCurrency ?? DEFAULT_CURRENCY`.
- The page calls `useUpdateUserCurrencyMutation()`.
- After a successful mutation, the page calls `refreshAppUser()` from auth context.
- The UI explicitly documents that changing default currency only affects future dues; existing dues keep their own stored currency.

## UI Composition

### Important layouts

| File                                   | Responsibility                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/layouts/AuthLayout.tsx`           | Auth-page wrapper                                                                                        |
| `src/layouts/DashboardLayout.tsx`      | Signed-in application shell with `HamburgerMenu`, centered max-width container, and padded main content  |
| `src/layouts/RootLayout.tsx`           | Additional shared layout file present in the repo; the current route tree roots at `App`                 |
| `src/layouts/ScrollablePageLayout.tsx` | Shared layout for pages with a `PageHeader`, scrollable content area, and optional bottom submit section |

### Important reusable components

| File                                 | Responsibility                        |
| ------------------------------------ | ------------------------------------- |
| `src/components/PageHeader.tsx`      | Standard page header and actions      |
| `src/components/HamburgerMenu.tsx`   | Main signed-in navigation drawer/menu |
| `src/components/DueItem.tsx`         | Reusable due-card presentation        |
| `src/components/UserDueTile.tsx`     | User relationship summary tile        |
| `src/components/UserSearchInput.tsx` | Search and select users/friends       |

### Utility layer

Useful helpers for reading business behavior:

- `src/utils/format-currency.ts`
- `src/utils/format-date.ts`
- `src/utils/auth.ts`
- `src/utils/cn.ts`

The currency formatting helpers are especially important because many dashboard and list views aggregate or display values by currency.

## Change Guide

This section is for future maintainers and AI models.

### If you need to add a new page

1. Create the page under `src/pages/`.
2. Add a lazy import and route entry in `src/routes/index.tsx`.
3. Decide whether the page belongs under `AuthLayout` or `DashboardLayout`.
4. Add any query hooks or service functions needed for data access.

### If you need to change loading or toast behavior

Start with:

- `src/App.tsx`
- `src/main.tsx`

`src/App.tsx` owns router pending UI, lazy-load fallback UI, and the global toast container. `src/main.tsx` owns the initial boot-loader removal.

### If you need to change auth rules

Start with:

- `src/routes/index.tsx`
- `src/providers/auth.provider.tsx`
- `firestore.rules`

Be careful to separate:

- route-level access control
- Firebase Auth identity
- Firestore document authorization

### If you need to add a new Firestore operation

Recommended path:

1. Add the function in `src/services/firestore.ts`.
2. Wrap it in a React Query hook under `src/hooks/api/` if it is used by pages.
3. Add or update query keys in `src/hooks/api/query-keys.ts`.
4. Invalidate affected caches after mutations.
5. Update `firestore.rules` if the operation changes the allowed document shape or lifecycle.

### If you need to change due lifecycle rules

Start with both:

- `src/services/firestore.ts`
- `firestore.rules`

The service layer and security rules must agree on:

- allowed states
- allowed transitions
- mutable vs immutable fields
- who is allowed to make each transition

### If you need to change branding

Start with:

- `scripts/set-app-config.mjs`
- `index.html`
- `public/`
- brand-specific `.env.*` files
- build and deploy scripts in `package.json`

## Constraints, Assumptions, and Risks

### Architectural constraints

- The app is client-only in this repo.
- Firestore is queried directly from the browser.
- Auth and data permissions depend heavily on Firestore security rules.
- The app relies on invalidation-based refresh, not real-time listeners.

### Product assumptions

- A due is always between exactly two users.
- One creator action can create many due documents, but each document still has only one creator and one ower.
- Currency totals are grouped, not converted.
- The creator is the authority who confirms or rejects settlement requests.

### Operational risks

- React Query freshness is time-based and mutation-driven, so external changes can appear stale for up to the stale window.
- Multi-brand deployment increases the chance of mismatched env files or deploying the wrong brand to the wrong Firebase project.
- The build process mutates `index.html` before production builds, so scripts matter to output correctness.

## Known Inconsistencies to Check

These are important for future maintainers because they may represent active bugs or incomplete refactors.

### 1. Firestore rules vs user document shape

`createUser()` in `src/services/firestore.ts` writes `preferredCurrency`, but `firestore.rules` currently validates user documents using a key list that does not include `preferredCurrency`.

If the deployed rules match the checked-in rules, user creation or update paths may fail unless the runtime environment differs from the repository state.

This matters for both:

- initial user creation
- the settings page's `updateUserCurrency()` mutation

### 2. Firestore rules vs due document shape

`createDues()` writes a `currency` field, but the checked-in `firestore.rules` `isValidDueCreate()` key list does not include `currency`.

That is another service/rules mismatch that should be verified before assuming the checked-in rules are current.

### 3. Update rules are strict field-preservation rules

The due update rules explicitly preserve most fields and only allow narrow status transitions. Any future mutation that changes additional fields must be reflected in both the client code and rules.

### 4. No test suite in the repo

There is currently no automated test command in `package.json`, so regressions must be caught through linting, manual verification, or a future test harness.

## Glossary

| Term                 | Meaning                                                 |
| -------------------- | ------------------------------------------------------- |
| Creator              | The user who created the due and is owed money          |
| Ower                 | The user who owes money                                 |
| Due                  | A single debt document between one creator and one ower |
| Open due             | A due in `active` or `resolve_requested` state          |
| Resolve request      | A debtor-side request to mark a due as paid             |
| Pending confirmation | A due waiting for the creditor to confirm settlement    |
| Preferred currency   | User-level currency preference used by parts of the UI  |
| Brand/app type       | The deployment identity, either Ledgi or Kamel Hisaab   |

## Final Orientation Notes

If you are another AI model receiving this repository as context, the fastest way to form a reliable mental model is:

1. Read `src/routes/index.tsx` to understand application surface area.
2. Read `src/providers/auth.provider.tsx` and `src/lib/firebase.ts` to understand identity and backend setup.
3. Read `src/services/firestore.ts` and `firestore.rules` together to understand actual domain operations and allowed transitions.
4. Read `src/hooks/api/` to understand cache behavior and page-level data contracts.
5. Read `src/pages/dashboard/index.tsx` and one detail page to understand how screens are assembled from hooks and components.

Treat the following files as the highest-value sources of truth:

- `src/routes/index.tsx`
- `src/providers/auth.provider.tsx`
- `src/services/firestore.ts`
- `firestore.rules`
- `package.json`
- `.env.example`

That set is usually enough to answer most architecture, runtime, and maintenance questions before you inspect the rest of the tree.
