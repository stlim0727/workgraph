# Workgraph

A conversation-first prototype for keeping ongoing work and its important concepts in context.

This repository currently implements **Phase 0 through Phase 2** from the [Graph V0 implementation handoff](docs/Graph_V0_Codex_Handoff.md): a Next.js foundation, three responsive screens, and Supabase-backed persistence for Works, Things, Messages, and Events.

## Requirements

- Node.js 22.12 or newer (`@supabase/supabase-js` requires Node 22+; the Cloudflare/Wrangler toolchain's `yargs` dependency requires 22.12+ specifically)
- npm 10 or newer
- A Supabase project (see below)

## Local setup

1. Create a Supabase project, then apply the migrations in `supabase/migrations/` to it (in order) via the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) or by pasting each file into the SQL editor:

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase project's URL and service role key (Project Settings → API in the Supabase dashboard):

   ```bash
   cp .env.example .env.local
   ```

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). The prototype includes:

- `/` — Home and active Works
- `/work/graph-app` — Work details, Things, and recent conversation
- `/work/graph-app/thing/product-vision` — Thing details (all seeded Things are navigable)

## Database

Schema and seed data live in `supabase/migrations/` (`works`, `things`, `relations`, `messages`, `events`, plus the dogfood seed data). Row Level Security is enabled on every table with no policies — all reads happen server-side through `lib/data.ts` using the service role key, which bypasses RLS. The service role key must never be exposed to the client bundle.

## Deploying to Cloudflare Workers

The app is set up for Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) (`open-next.config.ts`, `wrangler.jsonc`):

```bash
npx wrangler login          # once, to authenticate the CLI
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npm run deploy               # builds and deploys
```

`npm run preview` builds and runs the Worker locally via `wrangler dev` for a closer-to-production smoke test than `next dev`.

### PR previews

`.github/workflows/cloudflare-preview.yml` deploys every pull request to its own Worker (`workgraph-pr-<number>`) and comments the live URL on the PR, updating that comment on every subsequent push. The Worker is deleted when the PR closes. This needs four repository secrets under **Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN` — a token with Workers Scripts edit permission ([create one](https://dash.cloudflare.com/profile/api-tokens))
- `CLOUDFLARE_ACCOUNT_ID` — found on the right sidebar of any zone/account overview page in the Cloudflare dashboard
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — same values as `.env.local`

All PR previews currently point at the same Supabase project as local development — there's no separate per-preview or staging database yet.

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
