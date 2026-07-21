# Axol Work for Web

A responsive desktop web port of the Axol Work iOS app — an accessibility-focused
shift-work marketplace and professional network for neurodivergent and disability-inclusive
hiring. Two roles: **Seeker** and **Employer**. Reuses the existing `axol-work` Firebase
project and is **schema-compatible with the iOS app** (identical field names, enum raw values,
and deterministic document ids).

## Tech stack

- React 18 + TypeScript, Vite
- React Router 6
- Tailwind CSS (design tokens centralized in `tailwind.config.js`)
- Firebase JS SDK v10 (modular `firebase/auth`, `firebase/firestore`)
- Zustand (auth/session + social stores — mirrors the iOS `FirebaseAuthManager` / `SocialService` split)
- react-hook-form + zod, date-fns, lucide-react

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the Web app config from the Firebase console
npm run dev
```

Get the Web config from **Firebase console → Project settings → Your apps → Add app → Web (`</>`)**.
Do **not** use the iOS API key. Required vars (see `.env.example`):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=axol-work.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=axol-work
VITE_FIREBASE_STORAGE_BUCKET=axol-work.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Scripts: `npm run dev` · `npm run build` · `npm run preview` · `npm run typecheck`

## Architecture

```
src/
  lib/          firebase init + typed Firestore converters/helpers (no `any` on Firestore data)
  models/       TypeScript types for every collection + reference option lists (the iOS contract)
  stores/       authStore (session), socialStore (notifications/conversations/connections), themeStore
  app/          route resolver (AppRouteResolver port), MainApp routes, sidebar shell, nav config
  features/     one folder per feature: <feature>/api.ts + page/components
  components/    shared UI primitives (Button, Input, Modal, Avatar, Chip, Badge, …)
```

### Routing / gating (`src/app/resolveRoute.ts`)

Resolved in order: loading → **splash**; not logged in → **auth**; role `unassigned` →
**account type**; seeker without a completed profile → **seeker onboarding**; employer without
one → **employer onboarding**; otherwise → **main app** (role-specific sidebar).

### Firestore compatibility notes

- Field names / enum raw values match iOS exactly — do not rename.
- Deterministic ids (`src/lib/firestore.ts`): `conversations` & `connectionRequests` use
  `[uidA,uidB].sort().join("_")`; `employmentVerifications` uses `"{employerUID}_{seekerUID}"`.
- Real-time (`onSnapshot`) for messages, conversations, notifications, feeds, applications,
  shifts, connections, groups, reviews, verification requests.
- No Firebase Storage — avatars are generated initials; posts are text-only.

### Indexes (uses the project's existing deployed indexes)

Queries were written to lean on single-field auto-indexes where possible. A few use
`orderBy` alongside an equality filter and will need composite indexes if not already present
from the iOS app (Firestore's error links generate them on first run):

- `shifts`: `status ==` + `orderBy(startTime)`
- `shiftApplications`: `seekerUID ==` / `employerUID ==` + `orderBy(submittedAt desc)`
- `notifications`: `recipientUID ==` + `orderBy(createdAt desc)`
- `conversations`: `participantUIDs array-contains` + `orderBy(lastMessageAt desc)`
- `posts`: `groupID ==` + `orderBy(createdAt desc)`
- `employerReviews` / `workHistoryEntries`: equality + `orderBy(createdAt/requestedAt/submittedAt)`

Connections are read via two single-field queries (`userAUID ==` / `userBUID ==`) merged
client-side to avoid extra composite indexes.

## Accessibility

WCAG 2.1 AA: semantic HTML, visible focus rings, ≥44px hit targets, `aria-live` for dynamic
updates (messages/notifications), status paired with text+icon (never color alone),
`prefers-reduced-motion` gating, skip-to-content link, light/dark themes.
