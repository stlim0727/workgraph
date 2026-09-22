import type { Relation, Thing } from "@/lib/types";

const workId = "00000000-0000-4000-8000-000000000001";
const now = "2026-09-22T11:30:00.000Z";

function thing(index: number, slug: string, type: string, description: string, color: string): Thing {
  return {
    id: `10000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    workId,
    slug,
    name: slug,
    type,
    description,
    data: { experimental: true },
    color,
    createdAt: now,
    updatedAt: now,
  };
}

export const semanticThings: Thing[] = [
  thing(1, "resume-intent", "intent", "Make resuming a project materially better than summarizing chat history.", "coral"),
  thing(2, "semantic-claim", "claim", "A small semantic graph helps an agent reason about Work better than generic Things alone.", "violet"),
  thing(3, "derived-work-claim", "claim", "Useful work can be derived from unresolved project structure instead of stored as Tasks.", "blue"),
  thing(4, "semantic-value-unknown", "unknown", "Does semantic typing improve grounded project reasoning enough to justify its complexity?", "amber"),
  thing(5, "taskless-unknown", "unknown", "Can useful next moves be derived without storing Tasks?", "pink"),
  thing(6, "invisible-ontology-unknown", "unknown", "Can users benefit from semantic structure without manually maintaining an ontology?", "mint"),
  thing(7, "invisible-semantics", "constraint", "Users should not need to understand graph theory, lambda calculus, or ontology.", "coral"),
  thing(8, "experiment-spec", "artifact", "Semantic_Next_Moves_Experiment.md defines the hypothesis and falsification criteria.", "violet"),
];

function relation(index: number, from: number, type: string, to: number): Relation {
  return {
    id: `20000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    workId,
    fromThingId: semanticThings[from - 1].id,
    type,
    toThingId: semanticThings[to - 1].id,
    metadata: { experimental: true },
    createdAt: now,
  };
}

export const semanticRelations: Relation[] = [
  relation(1, 4, "challenges", 2),
  relation(2, 2, "supports", 1),
  relation(3, 5, "challenges", 3),
  relation(4, 3, "supports", 1),
  relation(5, 6, "depends_on", 2),
  relation(6, 7, "constrains", 2),
  relation(7, 8, "evidenced_by", 2),
];
