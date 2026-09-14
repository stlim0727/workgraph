export type WorkStatus = "active" | "paused" | "done";

export type Work = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: WorkStatus;
  createdAt: string;
  updatedAt: string;
};

export type Thing = {
  id: string;
  workId: string;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  data: Record<string, unknown>;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type Relation = {
  id: string;
  workId: string;
  fromThingId: string;
  type: string;
  toThingId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type Message = {
  id: string;
  workId: string;
  sequence: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type Event = {
  id: string;
  workId: string;
  actorType: "user" | "agent" | "system";
  actorId: string | null;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
};
