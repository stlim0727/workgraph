type Work = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: "active" | "paused" | "done";
  created_at: string;
  updated_at: string;
};

type Thing = {
  id: string;
  work_id: string;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type Relation = {
  id: string;
  work_id: string;
  from_thing_id: string;
  type: string;
  to_thing_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type Message = {
  id: string;
  work_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

type Event = {
  id: string;
  work_id: string;
  thing_id: string | null;
  actor_type: "user" | "agent" | "system";
  actor_id: string | null;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      works: Table<Work>;
      things: Table<Thing>;
      relations: Table<Relation>;
      messages: Table<Message>;
      events: Table<Event>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
