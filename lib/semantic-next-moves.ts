import type { Relation, Thing, Work } from "@/lib/types";

export type BecauseStep = {
  thingId: string;
  relationId?: string;
  explanation: string;
};

export type NextMove = {
  title: string;
  rationale: string;
  because: BecauseStep[];
  targets: string[];
  confidence: "low" | "medium" | "high";
};

export type NextMovesResult = {
  summary: string;
  unresolved: string[];
  moves: NextMove[];
};

export type WorkSnapshot = {
  work: Work;
  things: Thing[];
  relations: Relation[];
};

const SEMANTIC_TYPES = new Set(["intent", "claim", "unknown", "artifact", "constraint"]);

function display(thing: Thing) {
  return thing.description || thing.name;
}

export function deriveNextMoves({ things, relations }: WorkSnapshot): NextMovesResult {
  const byId = new Map(things.map((thing) => [thing.id, thing]));
  const unresolvedThings = things.filter((thing) => thing.type === "unknown");
  const semanticCount = things.filter((thing) => SEMANTIC_TYPES.has(thing.type)).length;

  const moves = unresolvedThings.slice(0, 3).map((unknown): NextMove => {
    const outgoing = relations.filter((relation) => relation.fromThingId === unknown.id);
    const incoming = relations.filter((relation) => relation.toThingId === unknown.id);
    const direct = [...outgoing, ...incoming]
      .map((relation) => ({
        relation,
        thing: byId.get(relation.fromThingId === unknown.id ? relation.toThingId : relation.fromThingId),
      }))
      .filter((entry): entry is { relation: Relation; thing: Thing } => Boolean(entry.thing));

    const claim = direct.find(({ thing }) => thing.type === "claim");
    const intent =
      direct.find(({ thing }) => thing.type === "intent") ??
      (claim
        ? relations
            .filter((relation) => relation.fromThingId === claim.thing.id || relation.toThingId === claim.thing.id)
            .map((relation) => ({
              relation,
              thing: byId.get(relation.fromThingId === claim.thing.id ? relation.toThingId : relation.fromThingId),
            }))
            .find((entry) => entry.thing?.type === "intent")
        : undefined);

    const because: BecauseStep[] = [
      { thingId: unknown.id, explanation: `Unresolved: ${display(unknown)}` },
    ];

    if (claim?.thing) {
      because.push({
        thingId: claim.thing.id,
        relationId: claim.relation.id,
        explanation: `It bears on the claim: ${display(claim.thing)}`,
      });
    }

    if (intent?.thing) {
      because.push({
        thingId: intent.thing.id,
        relationId: intent.relation.id,
        explanation: `That matters to the intent: ${display(intent.thing)}`,
      });
    }

    return {
      title: `Investigate: ${display(unknown)}`,
      rationale: claim?.thing
        ? `Resolving this unknown would strengthen or challenge “${display(claim.thing)}”.`
        : "This is explicitly unresolved in the current Work model.",
      because,
      targets: [unknown.id],
      confidence: intent?.thing ? "high" : claim?.thing ? "medium" : "low",
    };
  });

  return {
    summary:
      moves.length > 0
        ? `${unresolvedThings.length} unresolved question${unresolvedThings.length === 1 ? "" : "s"} are represented explicitly; ${moves.length} grounded next move${moves.length === 1 ? "" : "s"} can be derived without storing Tasks.`
        : semanticCount > 0
          ? "Semantic project state exists, but there are no explicit unresolved questions from which to derive work."
          : "This Work has no semantic project state yet, so next moves cannot be grounded.",
    unresolved: unresolvedThings.map((thing) => thing.id),
    moves,
  };
}

export function blindSnapshot(snapshot: WorkSnapshot): WorkSnapshot {
  return {
    ...snapshot,
    things: snapshot.things.map((thing) => ({ ...thing, type: "thing" })),
    relations: snapshot.relations.map((relation) => ({ ...relation, type: "related_to" })),
  };
}


export type ExperimentMetrics = {
  unresolvedDetected: number;
  groundedMoves: number;
  provenanceSteps: number;
  intentConnectedMoves: number;
};

export type SemanticExperimentResult = {
  semantic: NextMovesResult;
  blinded: NextMovesResult;
  semanticMetrics: ExperimentMetrics;
  blindedMetrics: ExperimentMetrics;
  delta: ExperimentMetrics;
  interpretation: string;
};

function metrics(result: NextMovesResult, snapshot: WorkSnapshot): ExperimentMetrics {
  const typeById = new Map(snapshot.things.map((thing) => [thing.id, thing.type]));
  return {
    unresolvedDetected: result.unresolved.length,
    groundedMoves: result.moves.length,
    provenanceSteps: result.moves.reduce((sum, move) => sum + move.because.length, 0),
    intentConnectedMoves: result.moves.filter((move) =>
      move.because.some((step) => typeById.get(step.thingId) === "intent"),
    ).length,
  };
}

function subtract(a: ExperimentMetrics, b: ExperimentMetrics): ExperimentMetrics {
  return {
    unresolvedDetected: a.unresolvedDetected - b.unresolvedDetected,
    groundedMoves: a.groundedMoves - b.groundedMoves,
    provenanceSteps: a.provenanceSteps - b.provenanceSteps,
    intentConnectedMoves: a.intentConnectedMoves - b.intentConnectedMoves,
  };
}

export function runSemanticExperiment(snapshot: WorkSnapshot): SemanticExperimentResult {
  const semantic = deriveNextMoves(snapshot);
  const blindedSnapshot = blindSnapshot(snapshot);
  const blinded = deriveNextMoves(blindedSnapshot);
  const semanticMetrics = metrics(semantic, snapshot);
  const blindedMetrics = metrics(blinded, blindedSnapshot);
  const delta = subtract(semanticMetrics, blindedMetrics);

  const semanticAddsSignal =
    delta.groundedMoves > 0 &&
    delta.provenanceSteps > 0 &&
    delta.intentConnectedMoves > 0;

  return {
    semantic,
    blinded,
    semanticMetrics,
    blindedMetrics,
    delta,
    interpretation: semanticAddsSignal
      ? "The semantic representation exposes actionable gaps and provenance that disappear when the same graph is blinded. This supports continuing the experiment, but does not yet show that an LLM performs better."
      : "Blinding the semantic labels did not materially reduce deterministic next-move derivation. The current ontology is not earning its complexity and should be simplified or rejected.",
  };
}
