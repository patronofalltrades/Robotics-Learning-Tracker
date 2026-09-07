# Robotics & Physical AI Learning Tracker

A private Friday/Saturday notebook for the 12-week syllabus in [`robotics-physical-ai-learning-path.md`](./robotics-physical-ai-learning-path.md). The tracker keeps activity completion, conversation briefs, confidence, time, milestone scores, and open questions in owner-scoped Firestore documents.

## Local setup

Requirements: Node.js 22.x and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app is fail-closed by default. Missing Firebase variables show an unconfigured login screen; no implicit demo user is created.

### Explicit demo mode

For a local preview only, set this in `.env.local`:

```dotenv
NEXT_PUBLIC_DEMO_MODE=true
```

Demo mode is honored only when `NODE_ENV` is `development` or `test`; it is never enabled in a production build. Demo changes are held in memory and are not a substitute for Firestore persistence.

## Firebase setup

1. Create a Firebase project and a Web app in the Firebase console.
2. Enable Authentication → Sign-in providers → Google.
3. Add `localhost` and your deployed domain under Authentication → Settings → Authorized domains.
4. Create Firestore in region `us-west2` (or update the region to match your project policy).
5. Copy the Web app’s public configuration into `.env.local` using [`.env.example`](./.env.example). These are client-side Firebase values, not admin credentials.
6. Deploy the Google provider configuration, owner-only rules, and indexes:

```bash
npx firebase login
npx firebase use YOUR_PROJECT_ID
npx firebase deploy --only auth,firestore
```

`.firebaserc` targets the non-secret Firebase project ID `robotics-tracker-hanif-906`. Use `firebase use YOUR_PROJECT_ID` when deploying a fork. Never commit service-account keys or admin credentials.

## Emulator and tests

```bash
npm run typecheck
npm run lint
npm test
npm run test:rules
npm run test:e2e
npm run build
```

`test/firestore-emulator.test.ts` is the real rules test. `npm run test:rules` starts the Firestore emulator, checks unauthenticated/other-user denial, owner access to user/week/milestone paths, and unexpected-root denial. The static rules test is a lightweight fallback when no emulator is running.

## Deployment (Vercel)

Import this repository into Vercel (the included [`vercel.json`](./vercel.json) selects Next.js), add all `NEXT_PUBLIC_FIREBASE_*` variables in the correct Production/Preview environments, and add the Vercel domain to Firebase Authorized domains. Keep Deployment Protection enabled for Preview deployments if the notebook contains real learning notes. Do not set `NEXT_PUBLIC_DEMO_MODE=true` in Production.

## Data, exports, and reset

The app writes only to `users/{uid}`, `users/{uid}/weeks/{weekId}`, and `users/{uid}/milestones/{checkpointId}`. Firestore rules deny all other roots and require the signed-in UID to match the document owner. Settings provides Markdown and schema-versioned JSON exports generated in the browser. Reset requires typing `RESET MY NOTEBOOK` and deletes the signed-in user’s week/milestone documents; export first if you need a copy.

This is a private notebook, not a compliance system. Review Firebase region, retention, access, Google account, and Vercel preview settings for your own privacy requirements. The app does not use admin APIs, service-account credentials, or persistent offline caching.
