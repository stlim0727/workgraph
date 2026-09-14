import type { Message, Thing, Work } from "@/lib/types";

const workId = "00000000-0000-4000-8000-000000000001";

export const work: Work = {
  id: workId,
  slug: "graph-app",
  title: "Graph 앱 만들기",
  summary: "대화가 상태를 안전하게 바꾸는, 가장 작고 지속 가능한 작업 공간을 만들고 있어요.",
  status: "active" as const,
  createdAt: "2026-08-30T07:12:00.000Z",
  updatedAt: "2026-08-31T01:42:00.000Z",
};

export const things: Thing[] = [
  ["product-vision", "vision", "Workgraph가 해결하려는 문제와 제품의 중심 원칙", "coral"],
  ["graph", "concept", "Things 사이의 관계로 만들어지는 작업의 맥락", "violet"],
  ["lambda", "concept", "작은 행동 단위에 대한 초기 아이디어", "blue"],
  ["things", "system", "계속 참조할 가치가 있는 개념과 결과물", "mint"],
  ["process", "concept", "작업이 앞으로 나아가는 방식", "amber"],
  ["mode", "idea", "상황에 따른 작업 인터페이스 아이디어 — 현재 보류", "pink"],
  ["plugin", "idea", "기능 확장을 위한 장기 아이디어 — V0 범위 밖", "blue"],
  ["prototype", "deliverable", "검증을 위한 첫 번째 동작 가능한 제품", "coral"],
  ["notion", "reference", "기존 작업 도구와 비교하기 위한 레퍼런스", "violet"],
].map(([name, type, description, color], index) => ({
  id: `00000000-0000-4000-8000-${String(index + 101).padStart(12, "0")}`,
  workId,
  slug: name,
  name,
  type,
  description,
  data: {},
  color,
  createdAt: "2026-08-30T07:12:00.000Z",
  updatedAt: "2026-08-31T01:42:00.000Z",
}));

export const messages: Message[] = [
  { id: "mock-message-1", workId, sequence: 1, role: "user", content: "지금 우리가 가장 먼저 검증해야 하는 게 뭐야?", createdAt: "2026-08-31T01:36:00.000Z" },
  {
    id: "mock-message-2",
    workId,
    sequence: 2,
    role: "assistant",
    content: "핵심은 며칠 뒤에도 이 공간으로 돌아와 ‘어디까지 왔지?’라고 자연스럽게 묻게 되는지예요. 지금은 @prototype으로 그 흐름을 최대한 작게 확인하는 단계예요.",
    createdAt: "2026-08-31T01:37:00.000Z",
  },
];

export function getThing(slug: string) {
  return things.find((thing) => thing.slug === slug);
}
