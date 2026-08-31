# Graph V0 — Codex Implementation Handoff

> Source handoff document for implementing Workgraph V0.

## Product goal

This app is not initially a traditional project-management product. The V0 hypothesis is that a user can keep one ongoing **Work**, converse naturally inside it, preserve important concepts as **Things**, and let an agent read and safely mutate persistent state.

Core validation question:

> After a few days, does the user naturally open this app and ask “Where are we now?”

## Core UX

Users should not need to understand Graph, Lambda, or ontology. The surface model is deliberately small:

- **Work** — something ongoing, e.g. “Graph 앱 만들기”.
- **Thing** — something worth persistently referring to, e.g. `@prototype`, `@plugin`, `@lambda`.
- **Conversation** — the primary interface for understanding and changing Work state.
- **Agent** — reasons over Work state and can invoke a small set of allowed application actions.

## V0 scope

Implement:

- Work list and Work creation
- Work detail screen
- Thing create/read/update
- Relations between Things
- Persistent conversation per Work
- `@` mention of Things
- Restricted structured Agent actions
- Event log for important mutations
- Agent responses grounded in current Work state

Do **not** implement in V0: Kanban, Gantt, Calendar, subtasks, sprints, backlog, teams/roles, notifications, plugin SDK/marketplace, Mode framework, graph visualization, workflow builder, automation engine, strict ontology, graph DB, or complex realtime collaboration.

## Recommended stack

- Next.js + React + TypeScript + Tailwind
- Next.js server-side/API layer
- Supabase PostgreSQL
- Supabase client/server utilities; ORM is optional and unnecessary initially
- OpenAI API structured tool/function calling
- No realtime requirement for V0

## Core data model

```ts
type Work = {
  id: string
  title: string
  summary: string | null
  status: "active" | "paused" | "done"
  createdAt: string
  updatedAt: string
}

type Thing = {
  id: string
  workId: string
  name: string
  type: string
  description: string | null
  data: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

type Relation = {
  id: string
  workId: string
  fromThingId: string
  type: string
  toThingId: string
  metadata: Record<string, unknown>
  createdAt: string
}

type Message = {
  id: string
  workId: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: string
}

type Event = {
  id: string
  workId: string
  actorType: "user" | "agent" | "system"
  actorId: string | null
  type: string
  payload: Record<string, unknown>
  createdAt: string
}
```

`Thing.type` and `Relation.type` start as strings. Do not build a strict ontology yet.

## Three screens only

### Home

Shows active Works and a `Start something` action. No board or folder tree.

### Work

The central V0 screen. Show Work title/summary, Things, recent conversation, and a conversation input.

### Thing

A lightweight detail screen with type, description, related Things, recent activity, and a way to ask about the Thing. Do not turn this into a database/property editor.

## @ mentions

Typing `@` in conversation should eventually show a picker for Things in the current Work. Preserve the selected Thing identity, not only its label, so agent context can receive resolved IDs and minimal Thing context.

## Agent action boundary

The Agent must never receive unrestricted SQL/database access. It may call only application-level actions such as:

```ts
createThing({ workId, name, type, description?, data? })
updateThing({ thingId, patch })
relateThings({ fromThingId, relationType, toThingId })
updateWork({ workId, patch })
```

Important mutations should write an Event automatically in the mutation/application layer.

## Agent context

Do not blindly send the entire conversation on every request. Start with:

```text
current Work
+ Work summary
+ explicitly mentioned Things
+ directly related Things
+ recent Events
+ recent Messages
+ available Actions
```

V0 does not need vector search. Explicit mentions, recent state, and one-hop relations are enough initially.

## Dogfood seed

First Work:

`Graph 앱 만들기`

Initial Things:

- `@product-vision`
- `@graph`
- `@lambda`
- `@things`
- `@process`
- `@mode`
- `@plugin`
- `@prototype`
- `@notion`

The app should eventually be used to manage its own development.

## Implementation phases

### Phase 0 — Bootstrap

- Next.js + TypeScript + Tailwind runs locally.
- README explains local setup.
- Avoid unnecessary dependencies.

### Phase 1 — Static UI

- Build Home, Work, Thing using mock data.
- Do not connect Supabase/OpenAI yet.
- Basic mobile/desktop layout should work.

### Phase 2 — Persistence

- Connect Supabase.
- Add `works`, `things`, `relations`, `messages`, `events` schema/migrations.
- Work/Thing persistence works.
- Mutations record Events.

### Phase 3 — Conversation

- Send and persist Work messages.
- Assistant may initially be mock/echo.
- Conversation survives reload.

### Phase 4 — Agent Read

- Connect OpenAI API.
- Implement AgentContext builder.
- Agent can answer questions from persistent Work/Thing state.

### Phase 5 — Agent Mutation

- Connect createThing/updateThing/relateThings/updateWork tools.
- Validate all tool arguments in application layer.
- Mutation and Event log occur together.
- UI reflects changed state.

### Phase 6 — @ Mention

- `@` opens current Work Thing picker.
- Preserve Thing IDs safely.
- Agent context resolves mentions correctly.

### Phase 7 — Dogfood

- Seed the product-development Work.
- Use the app for its own development.
- Expand schema only in response to actual usage.

## Rules against overengineering

- Do not introduce repository patterns, event buses, CQRS, microservices, or graph DB “for the future”.
- Do not build Plugin/Mode abstractions in V0.
- Do not pre-design a Thing/Relation type hierarchy.
- Prefer direct OpenAI API integration if an AI framework adds no clear value.
- Extract UI abstractions only after real repetition.
- Do not implement future phases during the current phase.

## Security basics

- Never expose OpenAI keys or Supabase service credentials to the client bundle.
- Validate user input and Agent tool arguments server-side.
- Never trust LLM-generated tool arguments directly.
- Scope all queries to the correct `work_id`.
- Do not overbuild authentication/authorization for the single-user V0.

## First Codex task

Implement **Phase 0 and Phase 1 only**.

Requirements:

1. Create or adapt a Next.js + TypeScript + Tailwind app.
2. Build only three mock-data screens: Home, Work, Thing.
3. Use a clean, modern, conversation-first UI.
4. Do not add Supabase, OpenAI, graph libraries, plugin systems, or agent abstractions yet.
5. Keep components and folder structure simple.
6. Seed mock Work `Graph 앱 만들기` and Things: `product-vision`, `graph`, `lambda`, `things`, `process`, `mode`, `plugin`, `prototype`, `notion`.
7. Make navigation between the three screens work.
8. Run available lint/typecheck/build checks.
9. At the end report files changed, how to run, what was intentionally not implemented, and any issue the developer needs to know about.
10. **Do not proceed to Phase 2 until explicitly requested.**

## Definition of done for every Codex task

- Change only requested scope.
- Do not unnecessarily break existing behavior.
- No TypeScript errors.
- Run lint/build when available.
- DB changes leave migrations/source-of-truth in repo.
- New environment variables update `.env.example` and README; never commit secrets.
- Report implementation result and manual test steps briefly.

## Product success criterion

V0 succeeds when, after several days of dogfooding, the user naturally asks:

> “Graph 앱 지금 어디까지 왔어?”

and the answer is materially better than summarizing chat history because the system persistently knows the Things, decisions, paused ideas, relations, and current Work state.

**Guiding principle: Build the smallest persistent world in which conversation can safely change state.**
