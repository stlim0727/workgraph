# Workgraph

A conversation-first static prototype for keeping ongoing work and its important concepts in context.

This repository implements **Phase 0 through Phase 3** from the [Graph V0 implementation handoff](docs/Graph_V0_Codex_Handoff.md): a Next.js foundation, three responsive screens, Supabase-backed Work/Thing persistence, and persistent Work conversation.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Local setup

```bash
npm install
npm run db:setup # once, after configuring the Supabase CLI/project
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The prototype includes:

- `/` — Home and the active Work
- `/work/graph-app` — Work details, Things, and recent conversation
- `/work/graph-app/thing/product-vision` — Thing details (all mock Things are navigable)

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Supabase persistence

Without Supabase credentials the app remains runnable in read-only demo mode using `lib/mock-data.ts`. To enable persistent Work and Thing creation, Thing editing, relations, conversation, and mutation Events:

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set `SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service role key with a `NEXT_PUBLIC_` prefix or commit `.env.local`.
3. Link the Supabase CLI to the project, then run `npm run db:setup` to apply `supabase/migrations`.
4. Start the app with `npm run dev`.

The migration enables row-level security and does not grant browser roles direct table or mutation-function access. All reads and mutations run on the server. Mutation RPCs create their corresponding Event in the same database transaction.

## Current scope

Work, Thing, relation, Message, and Event data use Supabase when configured. Conversation submissions atomically persist the user message, a temporary assistant response, and an Event. The temporary response intentionally does not use OpenAI or claim to reason over Work context.

The following are intentionally **not implemented** yet:

- OpenAI or agent actions
- OpenAI-backed responses and the `@` mention picker
- Authentication, realtime updates, graph visualization, plugins, or modes

Those belong to later phases and should not be added until explicitly requested.
