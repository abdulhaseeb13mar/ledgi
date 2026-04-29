# Ledgi Monorepo

This repository contains two related frontend codebases for Ledgi:

- `app/`: Expo React Native mobile app
- `web/`: Vite React web app

Both apps use Firebase Authentication and Firestore, and share similar domain concepts (users, friends, dues, receivables, pending confirmations).

## Codebase Overview

### Mobile (`app/`)

- Stack: Expo, React Native, TypeScript, React Navigation, TanStack Query, Firebase
- Purpose: iOS/Android app for creating and managing dues between friends
- Main source: `app/src/`
- Entry/config highlights:
  - Expo config: `app/app.json`
  - Firebase init: `app/src/lib/firebase.ts`
  - Navigation: `app/src/navigation/index.tsx`

### Web (`web/`)

- Stack: React, Vite, TypeScript, TanStack Router, TanStack Query, Firebase, Tailwind CSS
- Purpose: Browser version of the same dues workflow
- Main source: `web/src/`
- Entry/config highlights:
  - Vite config: `web/vite.config.ts`
  - Firebase init: `web/src/lib/firebase.ts`
  - Routing: `web/src/router.tsx` and `web/src/routes/`
- Supports two brand modes:
  - `ledgi`
  - `kamelhisaab`

## Prerequisites

- Node.js 18+
- For mobile: Expo Go app (or iOS Simulator / Android Emulator)
- Package managers:
  - Mobile: npm (or any compatible package manager)
  - Web: pnpm (recommended; lockfile is pnpm)

## Run The Mobile App (`app/`)

1. Install dependencies:

```bash
cd app
npm install
```

2. Create a `.env` file in `app/` with Firebase values:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

3. Start Expo:

```bash
npm run start
```

4. Launch target:

```bash
npm run ios
# or
npm run android
# or
npm run web
```

Optional checks:

```bash
npm run test
npm run typecheck
```

## Run The Web App (`web/`)

1. Install dependencies:

```bash
cd web
pnpm install
```

2. Set up environment files from `web/.env.example`:

- `web/.env.ledgi`
- `web/.env.kamelhisaab`

Required keys:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_APP_TYPE=
```

3. Start dev server:

```bash
pnpm run dev:ledgi
# or
pnpm run dev:kamelhisaab
```

4. Build and preview:

```bash
pnpm run build:ledgi
# or
pnpm run build:kamelhisaab

pnpm run preview
```

Optional checks:

```bash
pnpm run lint
```

## Quick Folder Map

- `app/src/components`: shared UI pieces for mobile
- `app/src/screens`: mobile screens
- `app/src/hooks/api`: query/mutation hooks for data access
- `app/src/services/firestore.ts`: Firestore operations (mobile)
- `web/src/pages`: page-level features
- `web/src/components`: shared UI for web
- `web/src/hooks/api`: query/mutation hooks for web
- `web/src/services/firestore.ts`: Firestore operations (web)

## Notes

- Mobile and web codebases are separate projects and should be installed/run independently.
- Both projects expect valid Firebase configuration before authentication or data features work.