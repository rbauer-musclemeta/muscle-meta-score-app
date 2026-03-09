# Muscle-Meta Assessment App

React/Vite PWA + Convex backend for Catabolic Crisis screening and Functional Decline scoring.

## Quick start

1. `npm install`
2. Set env values in `.env.local`:
   - `VITE_CONVEX_URL`
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `CLERK_JWT_ISSUER_DOMAIN` (for Convex auth config)
3. `npm run dev`

## Validation commands

- Frontend build: `npm run build`
- Convex local TS check: `npm run typecheck:convex`

## Convex setup note

`convex dev --once` requires an initialized Convex project/deployment.
If not configured yet, run `npx convex dev` interactively once on your machine.

Temporary local stubs exist in `convex/_generated/*` so app code compiles before
real Convex codegen is available. Replace them with generated files after setup.

## Source of truth

Architecture and scoring specs live in `/docs` and `/config`.