export type Thing = {
  slug: string;
  name: string;
  type: string;
  description: string;
  color: string;
};

export const work = {
  slug: "graph-app",
  title: "Graph 앱 만들기",
  summary: "대화가 상태를 안전하게 바꾸는, 가장 작고 지속 가능한 작업 공간을 만들고 있어요.",
  status: "active" as const,
  updatedAt: "오늘, 오전 10:42",
};

export const things: Thing[] = [
  { slug: "product-vision", name: "product-vision", type: "vision", description: "Workgraph가 해결하려는 문제와 제품의 중심 원칙", color: "coral" },
  { slug: "graph", name: "graph", type: "concept", description: "Things 사이의 관계로 만들어지는 작업의 맥락", color: "violet" },
  { slug: "lambda", name: "lambda", type: "concept", description: "작은 행동 단위에 대한 초기 아이디어", color: "blue" },
  { slug: "things", name: "things", type: "system", description: "계속 참조할 가치가 있는 개념과 결과물", color: "mint" },
  { slug: "process", name: "process", type: "concept", description: "작업이 앞으로 나아가는 방식", color: "amber" },
  { slug: "mode", name: "mode", type: "idea", description: "상황에 따른 작업 인터페이스 아이디어 — 현재 보류", color: "pink" },
  { slug: "plugin", name: "plugin", type: "idea", description: "기능 확장을 위한 장기 아이디어 — V0 범위 밖", color: "blue" },
  { slug: "prototype", name: "prototype", type: "deliverable", description: "검증을 위한 첫 번째 동작 가능한 제품", color: "coral" },
  { slug: "notion", name: "notion", type: "reference", description: "기존 작업 도구와 비교하기 위한 레퍼런스", color: "violet" },
];

export const messages = [
  { role: "user" as const, content: "지금 우리가 가장 먼저 검증해야 하는 게 뭐야?", time: "10:36" },
  {
    role: "assistant" as const,
    content: "핵심은 며칠 뒤에도 이 공간으로 돌아와 ‘어디까지 왔지?’라고 자연스럽게 묻게 되는지예요. 지금은 @prototype으로 그 흐름을 최대한 작게 확인하는 단계예요.",
    time: "10:37",
  },
];

export function getThing(slug: string) {
  return things.find((thing) => thing.slug === slug);
}
