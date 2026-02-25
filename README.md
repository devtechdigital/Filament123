# Filament.home

Mobile-first LAN web app for filament spool tracking, AMS slot assignment, and NFC read/write.

## Stack
- Next.js (App Router, TypeScript, Tailwind)
- Convex backend + Convex Auth (email verification code)
- Android Chrome Web NFC
- Docker deployment behind Caddy (`tls internal`)

## Features (v1)
- Email code auth (`/signin`)
- Auto-create default printer + AMS 1 + 4 slots on first authenticated dashboard load
- 1..N AMS units (4 slots each)
- Spool create/edit/list with ULID spool IDs (server generated)
- Assign/move/unload spools in AMS slots
- NFC write (`/spool/[spoolId]`)
- NFC scan (`/scan`)

## Local development
1. Install deps:
   - `npm install`
2. Copy env template:
   - `cp .env.example .env.local`
3. Configure Convex project/deployment:
   - `npx convex dev`
4. Run app:
   - `npm run dev`

## Build and test
- Lint: `npm run lint`
- Type/build: `npm run build`

## Docker
Build and run:

```bash
docker compose up --build -d
```

Container serves Next.js on internal `3000`; host publishes `3005`.

## Caddy
Example in [`Caddyfile.example`](./Caddyfile.example).

```caddy
filament.home {
  tls internal
  reverse_proxy 192.168.1.10:3005
}
```

## Convex backend files
- `convex/schema.ts`
- `convex/auth.ts`
- `convex/printers.ts`
- `convex/spools.ts`

## Notes
- `getOrCreateDefaultPrinter` is implemented as a mutation because Convex queries are read-only.
- If `AUTH_RESEND_KEY` is not set, OTP codes are logged from auth function for local testing.
