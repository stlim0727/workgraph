# Long-Horizon State Recovery Experiment

## Why this experiment exists

The first three probes showed:

1. Explicit semantic roles improved epistemic precision.
2. The advantage became small when prose itself made the roles obvious.
3. On a ten-item fixture, explicit graph topology did not outperform a flat collection.

That makes small static fixtures a poor test of the WorkGraph thesis.

The next experiment tests whether persistent structure earns its keep when a project changes over time and old information remains plausible but is no longer current.

## Hypothesis

The useful product primitive is not necessarily a graph.

A stronger hypothesis is:

> A persistent, truth-maintained project model improves recovery of current state when project history contains superseded beliefs, changed constraints, contradictory evidence, abandoned approaches, and decisions whose rationale is distributed across time.

Graph structure is one possible implementation of that model.

## Experimental conditions

All conditions contain the same underlying project facts.

### A — Flat history

The model receives the complete chronological project history.

It must infer which statements are current, superseded, contradicted, or merely historical.

### B — Curated current state

The model receives only the current project records, with stable IDs and natural-language text.

No explicit semantic roles or relations are supplied.

This tests whether curation alone solves most of the problem.

### C — Structured current model

The model receives:

- current project records
- semantic roles
- explicit relationships
- provenance links to historical records
- explicit supersession / contradiction information

This tests whether WorkGraph-style structure adds value beyond a well-curated current-state context.

## Fixture requirements

Use approximately 60 records spanning several simulated weeks.

The fixture must include:

- at least 3 parallel concerns
- at least 5 claims that later become obsolete
- at least 3 changed constraints
- at least 3 decisions with rationale in earlier records
- at least 3 contradictory observations
- at least 2 abandoned approaches
- at least 5 artifacts with multiple versions
- at least 5 unresolved questions
- distracting but legitimate historical material
- no single sentence that directly summarizes the final current state

The fixture should be deterministic and generated once. Conditions A, B, and C must be projections of that same fixture, not separately authored stories.

## Questions

Each isolated model receives the same questions:

1. Where is the project now?
2. What is currently blocking progress?
3. What should happen next, and why?
4. Which earlier beliefs or decisions should no longer guide work?
5. What current constraints must be respected?
6. For each important conclusion, identify the persisted records that justify it.

## Scoring

Score blind before revealing condition labels.

### Current-state accuracy

Does the response distinguish current state from historical state?

### Supersession accuracy

Does it avoid relying on obsolete claims, constraints, artifacts, and decisions?

### Contradiction handling

Does it identify conflicts and use later/current evidence correctly without inventing reconciliation?

### Provenance

Can important conclusions be traced to persisted records?

### Gap detection

Does it distinguish:

- epistemic gaps — something important is unknown
- normative/state gaps — known reality does not satisfy intent or constraint
- dependency gaps — a prerequisite is not satisfied

### Next-move quality

Are proposed moves grounded in current gaps rather than obsolete history?

### Hallucination

Does the response introduce unsupported relationships, requirements, or evidence?

## Interpretation

Possible outcomes:

### C clearly beats B

Structured semantic state is adding value beyond curation. Continue investigating the minimum useful structure.

### B roughly equals C and both beat A

The main value is truth-maintained current-state curation, not graph structure.

This would be a major architectural result: WorkGraph should optimize state maintenance and retrieval rather than ontology.

### A roughly equals B and C

The model can reconstruct the project reliably from raw history at this scale. Increase temporal complexity and context pressure before adding product machinery.

### A beats B/C

The state-maintenance projection is discarding useful information or introducing misleading interpretation. Do not compensate by adding more ontology; inspect information loss first.

## Important design consequence

Do not treat `Task` as the unit of truth in this experiment.

Candidate work should be derived from current gaps. A gap itself should initially be derived rather than persisted as a new ontology object.

A useful provisional formulation is:

```
current project state + intent + constraints
                  |
                  v
                 GAP
        /          |          \
 epistemic      state       dependency
    gap           gap           gap
                  |
                  v
            candidate move
```

## Stop condition

Do not change the production schema based on this experiment.

The experiment earns a schema discussion only if structured current state repeatedly outperforms curated flat current state on long-horizon recovery, or if maintaining the curated state without explicit structure proves unreliable.
