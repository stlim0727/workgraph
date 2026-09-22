# Semantic Next-Moves Experiment

## Status

Experimental. This is not a schema migration or a commitment to a strict ontology.

## Question

Does a small amount of semantic structure let WorkGraph answer these questions materially better than generic Things + Relations?

1. Where are we now?
2. What is unresolved?
3. What should we investigate next, and why?
4. Which beliefs are assumptions rather than evidence?
5. What would make the primary intent satisfied?

## Hypothesis

A Work can remain structurally simple while using a few conventional Thing and Relation type strings to expose reasoning structure to the agent.

No Task primitive is introduced.

### Provisional Thing types

- `intent` — a condition or direction the Work is trying to establish.
- `claim` — a belief/hypothesis that may need support.
- `unknown` — an unresolved question whose answer may change the Work.
- `artifact` — externally inspectable evidence or output.
- `constraint` — a condition limiting acceptable outcomes.

These remain ordinary values in the existing `Thing.type: string`.

### Provisional Relation types

- `depends_on`
- `supports`
- `challenges`
- `evidenced_by`
- `constrains`
- `resolves`

These remain ordinary values in the existing `Relation.type: string`.

## Core rule

A proposed next move is not canonical project state.

It is a derived suggestion and MUST contain a traceable justification back to persisted Things/Relations.

Conceptually:

```
possible next move
  because -> unresolved unknown
  because -> claim/hypothesis
  because -> intent
```

Call this the BECAUSE chain.

## Seed model for WorkGraph itself

Suggested semantic Things:

- intent: "Build the smallest persistent world where conversation can safely change Work state."
- intent: "Make resuming a project materially better than summarizing chat history."
- claim: "A small semantic graph helps an agent reason about Work better than generic Things alone."
- claim: "Tasks can be derived from unresolved project structure rather than stored as a fundamental primitive."
- unknown: "Does semantic typing improve grounded project reasoning enough to justify its complexity?"
- unknown: "Can useful next moves be derived without storing Tasks?"
- unknown: "Can users benefit from semantic structure without manually maintaining an ontology?"
- constraint: "Users should not need to understand graph theory, lambda calculus, or ontology."
- constraint: "Do not redesign the database for this experiment."
- artifact: "Graph_V0_Codex_Handoff.md"
- artifact: "Current WorkGraph prototype"

Suggested relations should connect claims/unknowns back to intents and evidence. Prefer explicit, directional relations; avoid generic `related_to` when a stronger relation is known.

## deriveNextMoves contract

Implement initially as a pure/read-only function over a Work snapshot. It MUST NOT mutate Work state.

Input:

```ts
type WorkSnapshot = {
  work: Work
  things: Thing[]
  relations: Relation[]
  recentEvents?: Event[]
}
```

Output:

```ts
type BecauseStep = {
  thingId: string
  relationId?: string
  explanation: string
}

type NextMove = {
  title: string
  rationale: string
  because: BecauseStep[]
  targets: string[]
  confidence: "low" | "medium" | "high"
}

type NextMovesResult = {
  summary: string
  unresolved: string[]
  moves: NextMove[]
}
```

Requirements:

- Return at most 3 moves.
- Every move targets at least one persisted Thing ID.
- Every move includes a BECAUSE chain grounded in persisted Thing IDs.
- Do not invent evidence.
- Distinguish claims from artifacts/evidence.
- Prefer resolving unknowns that bear on an intent.
- If graph state is insufficient, say so instead of manufacturing work.
- A next move is a suggestion, not a Task and not persisted automatically.

## UI experiment

On the Work page, add a small experimental section:

```
Possible next moves

[ suggestion title ]
why this?
  unknown X
    -> bears on claim Y
      -> matters to intent Z
```

Do not add a workflow builder, Kanban board, graph canvas, autonomous execution, or Task CRUD.

## Typed-vs-blinded evaluation

Create a deterministic fixture from the same semantic graph in two forms:

A. Typed: preserve Thing.type and Relation.type.

B. Blinded: replace semantic Thing types with `thing` and Relation types with `related_to`, while preserving names/descriptions/topology.

Evaluate both against the five questions above.

Score manually on:

- grounding: claims cite actual persisted structure
- uncertainty: unknowns remain distinct from facts
- provenance: recommendations explain why they matter
- usefulness: suggested next moves would actually advance the Work
- hallucination: unsupported facts/relations introduced

Do not tune the blinded fixture to make it fail.

## Success criterion

Continue exploring semantic structure only if the typed condition is noticeably better in reasoning quality/provenance than the blinded condition.

## Falsification criteria

Stop or simplify the experiment if any of these holds:

- Generic Things + Relations perform essentially as well.
- Semantic types require substantial manual maintenance.
- The agent routinely misclassifies semantic types.
- BECAUSE chains are cosmetic rather than useful.
- Useful next moves require a Task primitive that cannot be represented as derived state.
- The experiment requires a schema redesign before demonstrating value.

## Non-goals

- strict ontology
- type hierarchy
- graph database
- autonomous agents
- workflow execution
- scheduling
- Task entity
- lambda-calculus runtime
- changing the existing V0 product thesis

## Implementation order

1. Add semantic fixture data only.
2. Implement pure graph traversal/ranking for candidate unresolved Things.
3. Add a read-only Next Moves presentation.
4. Add typed/blinded fixtures/tests.
5. Only after the deterministic structure works, optionally use an LLM to phrase/rank suggestions.
6. Evaluate before making any schema or roadmap change.
