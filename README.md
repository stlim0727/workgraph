# Workgraph

A conversation-first static prototype for keeping ongoing work and its important concepts in context.

This repository currently implements **Phase 0 and Phase 1 only** from the [Graph V0 implementation handoff](docs/Graph_V0_Codex_Handoff.md): a Next.js foundation and three responsive screens backed by local mock data.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Local setup

```bash
npm install
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

## Current scope

All data and activity are static mock content in `lib/mock-data.ts`. Buttons and the conversation composer are intentionally non-persistent in this phase.

The following are intentionally **not implemented** yet:

- Supabase or any database schema/persistence
- OpenAI or agent actions
- Working message submission and `@` mention picker
- Authentication, realtime updates, graph visualization, plugins, or modes

Those belong to later phases and should not be added until explicitly requested.
