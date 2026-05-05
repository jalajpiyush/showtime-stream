# CineLive

## Overview

A premium full-stack mobile-first streaming platform where users can buy tickets and watch movies or live shows online. Dark Netflix-style theme.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (dark cinema theme)
- **Backend**: Express 5 (Node.js)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Clerk (email/password)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Routing**: Wouter
- **State/Data**: TanStack React Query (Orval-generated hooks)
- **Animations**: Framer Motion

## Features

1. **Auth** — Clerk sign-up/sign-in with email
2. **Home** — Featured hero carousel, Now Showing, Upcoming shows grid
3. **Show Detail** — Poster backdrop, ticket purchase modal (mock payment)
4. **Video Player** — Access-controlled streaming, countdown for live events, live chat sidebar
5. **My Tickets** — Grid of purchased tickets
6. **Profile** — Display name, watch history with progress
7. **Admin Panel** — Dashboard stats, show CRUD, users list, purchases list

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Architecture

- Frontend artifact: `artifacts/cinelive/` — serves at `/`
- API server: `artifacts/api-server/` — serves at `/api`
- DB schema: `lib/db/src/schema/` — users, shows, tickets, watchHistory, chatMessages
- OpenAPI spec: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- Generated Zod schemas: `lib/api-zod/src/generated/`

## Notes

- After codegen, manually update `lib/api-zod/src/index.ts` to only export `./generated/api` (orval generates a stale index referencing non-existent files)
- Payment system is mock — always succeeds, generates a random payment ref
- Admin access: set `is_admin = true` in the `users` table for the desired user
- Video URLs use sample Google CDN videos; replace with real stream URLs in production
