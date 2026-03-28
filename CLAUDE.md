# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run lint:strict  # ESLint with zero warnings (used in CI)
npm run type-check   # TypeScript check without emitting
npm run code-quality # lint:strict + type-check
npm test             # Run all Jest tests
npm run test:watch   # Jest in watch mode
```

To run a single test file:

```bash
npx jest src/services/__tests__/domain-hacks.test.ts
```

## Architecture

This is a **Next.js 15+ App Router** application for discovering "domain hacks" — creative domain names formed by combining words with TLD extensions (e.g., "bill.gat.es").

### Key Concepts

**Domain Hacks Generation** (`src/services/domain-hacks.ts`): The core algorithm. Takes a search term, uses combinatorics (PowerSet + Permutations via `js-combinatorics`) to split words across domain labels and TLD extensions. The `DomainHacksGenerator` class validates results and filters by subdomain level.

**Data Flow**:

1. User searches → `GET /api/domains/search?term=` → `DomainHacksGenerator` → domain candidates
2. Each candidate's availability is checked via `GET /api/domains/[name]/status` → `src/services/api.ts` → external registrar APIs
3. TLD metadata (pricing, descriptions, type) is stored in **Supabase** (`src/services/tld-repository.ts`) with 60s TTL cache
4. Dictionary/browse feature is indexed in **Algolia** (`react-instantsearch`)

### External Services

- **Supabase** — TLD database (pricing, descriptions, types)
- **Algolia** — Search index for the dictionary/browse feature
- **Registrar APIs** — Dynadot, Gandi, NameSilo, Name.com, Porkbun for domain availability and pricing
- **OpenAI** — Generates TLD descriptions and classifies TLD types (run via nightly cron)
- **Amplitude** — Analytics (`src/contexts/AmplitudeContext.tsx`)

### Cron Jobs (`src/app/api/cron/`)

Scheduled via `vercel.json`, running nightly: TLD import from IANA, OpenAI-based description/type generation, pricing updates from each registrar, Algolia dictionary refresh.

### Path Alias

`@/*` maps to `src/*` — use this for all internal imports.

## Code Style

- **Prettier**: single quotes, trailing commas, tabWidth 4, printWidth 120
- **ESLint**: strict — zero warnings allowed. Plugins include `sonarjs`, `jsx-a11y`, `simple-import-sort`, `unused-imports`
- Pre-commit hook runs lint-staged (lint + format on staged files)
- Tests use Jest + jsdom + `@testing-library/react`

## Environment Variables

Required in `.env.local`: `DYNADOT_API_KEY`, `GANDI_API_KEY`, `NAMESILO_API_KEY`, `NAMECOM_API_USER`, `NAMECOM_API_TOKEN`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`, `ALGOLIA_WRITE_KEY`, `NEXT_PUBLIC_AMPLITUDE_API_KEY`, `RAPIDAPI_KEY`
