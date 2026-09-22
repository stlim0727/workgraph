import type { SemanticExperimentResult, WorkSnapshot } from "@/lib/semantic-next-moves";
import { blindSnapshot } from "@/lib/semantic-next-moves";

export type BenchmarkCondition = "semantic" | "blinded";

export type BenchmarkPrompt = {
  condition: BenchmarkCondition;
  system: string;
  input: string;
};

export type BenchmarkBundle = {
  version: string;
  prompts: BenchmarkPrompt[];
  rubric: string[];
};

function serialize(snapshot: WorkSnapshot) {
  return JSON.stringify(
    {
      work: { id: snapshot.work.id, title: snapshot.work.title, summary: snapshot.work.summary },
      things: snapshot.things.map(({ id, type, description, name }) => ({ id, type, text: description || name })),
      relations: snapshot.relations.map(({ id, fromThingId, type, toThingId }) => ({
        id,
        from: fromThingId,
        type,
        to: toThingId,
      })),
    },
    null,
    2,
  );
}

const system = `You are evaluating a project representation. Use only the supplied project state.
Do not assume facts not represented in it.
Return valid JSON with this exact shape:
{
  "whereWeAre": "string",
  "unresolved": [{"thingId":"string","question":"string"}],
  "nextMoves": [{
    "title":"string",
    "targetThingIds":["string"],
    "becauseThingIds":["string"],
    "rationale":"string"
  }],
  "assumptions": [{"thingId":"string","claim":"string"}],
  "satisfaction": "string"
}
Return at most 3 nextMoves. Every unresolved item, assumption, and next move must cite persisted Thing IDs.`;

const questions = `
Answer:
1. Where are we now?
2. What is unresolved?
3. What should we investigate next, and why?
4. Which beliefs are assumptions rather than evidence?
5. What would make the primary intent satisfied?
`;

export function createBenchmarkBundle(snapshot: WorkSnapshot): BenchmarkBundle {
  const blinded = blindSnapshot(snapshot);
  return {
    version: "semantic-vs-blinded-v1",
    prompts: [
      { condition: "semantic", system, input: `${questions}\nPROJECT STATE:\n${serialize(snapshot)}` },
      { condition: "blinded", system, input: `${questions}\nPROJECT STATE:\n${serialize(blinded)}` },
    ],
    rubric: [
      "Grounding: every cited Thing ID exists in the supplied state.",
      "Uncertainty: unresolved questions are not presented as established facts.",
      "Epistemic discipline: claims are distinguished from artifacts/evidence.",
      "Provenance: next moves identify a meaningful because-chain to project state.",
      "Intent alignment: suggested work is connected to what the Work is trying to achieve.",
      "No semantic-label leakage: blinded answers must not receive information from the semantic condition.",
    ],
  };
}

export function benchmarkSummary(result: SemanticExperimentResult) {
  return {
    deterministicSemanticMoves: result.semanticMetrics.groundedMoves,
    deterministicBlindedMoves: result.blindedMetrics.groundedMoves,
    warning:
      "This deterministic delta is not the LLM result. Run both benchmark prompts independently with the same model/settings and score the returned JSON against the rubric.",
  };
}
