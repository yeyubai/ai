# Native Shell

This package hosts the Android native container for the hybrid app.

## Scope

- Internal Android testing first
- Capacitor-based WebView container
- Existing `apps/web` remains the main product UI

## Prerequisites

- Node.js 20+
- JDK
- Android Studio

## Setup

1. Install dependencies from the repo root:
   - `npm run install:native`
2. Create the Android project:
   - `npm run native:android:add`
3. Point the shell at a reachable web URL:
   - copy `.env.example` to `.env`
   - set `NATIVE_WEB_APP_URL`
4. Sync the native project:
   - `npm run native:sync`
5. Open Android Studio:
   - `npm run native:open:android`

## Notes

- `NATIVE_WEB_APP_URL` is intended for internal testing and live reload style workflows.
- Android manifest currently allows cleartext traffic so `http://10.0.2.2:3000` style local testing works; tighten this before production.
- The placeholder `web/` directory only satisfies Capacitor's local web asset requirement during P0.
- Before public release, session storage should move behind a `SessionStorageAdapter` and native secure storage.
