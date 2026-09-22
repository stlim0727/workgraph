import {
  longHorizonQuestions,
  projectConditionA,
  projectConditionB,
  projectConditionC,
} from "./long-horizon-fixture";

export type LongHorizonCondition = "A" | "B" | "C";

const contract = {
  whereWeAre: "string",
  blockers: [{ thingIds: ["string"], issue: "string" }],
  nextMoves: [
    {
      title: "string",
      targetThingIds: ["string"],
      becauseThingIds: ["string"],
      rationale: "string",
    },
  ],
  obsolete: [{ thingIds: ["string"], reason: "string" }],
  currentConstraints: [{ thingIds: ["string"], constraint: "string" }],
};

function promptFor(state: unknown) {
  return [
    "You are recovering the current state of an ongoing project.",
    "You have no prior context. Use ONLY the persisted project data below.",
    "The project data may contain historical information that was once correct but is no longer current.",
    "Do not assume that an earlier record remains valid merely because it appears in the data.",
    "Do not invent evidence, requirements, relationships, or history.",
    "",
    "Answer these questions:",
    ...longHorizonQuestions.map((q, i) => `${i + 1}. ${q}`),
    "",
    "Return ONLY valid JSON matching this shape:",
    JSON.stringify(contract, null, 2),
    "",
    "Return at most 3 nextMoves. Ground every important conclusion in record IDs.",
    "",
    "PROJECT DATA:",
    JSON.stringify(state, null, 2),
  ].join("\n");
}

export function createLongHorizonBenchmark() {
  return {
    A: {
      hiddenLabel: "flat-history",
      prompt: promptFor(projectConditionA()),
    },
    B: {
      hiddenLabel: "curated-current-state",
      prompt: promptFor(projectConditionB()),
    },
    C: {
      hiddenLabel: "structured-current-model",
      prompt: promptFor(projectConditionC()),
    },
    scoring: [
      "Current-state accuracy",
      "Supersession accuracy",
      "Contradiction handling",
      "Provenance",
      "Gap detection",
      "Next-move quality",
      "Hallucination avoidance",
    ],
    expectedCriticalFacts: [
      "Build 25 has one qualifying 0.41% peak-load run (R55).",
      "Release approval now requires two consecutive runs below 0.5% (R58).",
      "Deployment remains paused pending one additional qualifying run (R59).",
      "The immediate unresolved question is whether build 25 remains below 0.5% on the second run (R61).",
      "The next move should therefore be another peak-load run of build 25.",
      "Current constraints include pre-payment inventory knowledge / reservation semantics (R28, R36), no catalog-service replacement (R50), and the two-run release rule (R58).",
      "The asynchronous-after-payment approach must not be revived because R37 rejected it.",
      "Old pool-only explanations and pool-size-40 solution claims must not guide current work.",
    ],
  };
}
