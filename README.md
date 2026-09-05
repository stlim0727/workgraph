# Workgraph

A conversation-first prototype for keeping ongoing work and its important concepts in context.

This repository currently implements **Phase 0 through Phase 2** from the [Graph V0 implementation handoff](docs/Graph_V0_Codex_Handoff.md): a Next.js foundation, three responsive screens, and Supabase-backed persistence for Works, Things, Messages, and Events.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer
- A Supabase project (see below)

## Local setup

1. Copy `.env.example` to `.env.local` and fill in your Supabase project's URL and service role key (Project Settings → API in the Supabase dashboard):

   ```bash
   cp .env.example .env.local
   ```

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). The prototype includes:

- `/` — Home and active Works
- `/work/graph-app` — Work details, Things, and recent conversation
- `/work/graph-app/thing/product-vision` — Thing details (all seeded Things are navigable)

## Database

Schema and seed data live in Supabase migrations (`works`, `things`, `relations`, `messages`, `events`), applied via the Supabase MCP tooling used to build this project. Row Level Security is enabled on every table with no policies — all reads happen server-side through `lib/data.ts` using the service role key, which bypasses RLS. The service role key must never be exposed to the client bundle.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Current scope

Work, Thing, Message, and Event data is read from Supabase (see `lib/data.ts`). Creating or editing Works/Things through the UI, and the conversation composer, are still non-persistent — buttons in the UI remain inert stubs.

The following are intentionally **not implemented** yet:

- Creating/editing Works and Things through the UI (mutations + Event logging on write)
- OpenAI or agent actions
- Working message submission and `@` mention picker
- Authentication, realtime updates, graph visualization, plugins, or modes

Those belong to later phases and should not be added until explicitly requested.
