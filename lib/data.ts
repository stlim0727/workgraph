import { getSupabaseServerClient } from "@/lib/supabase-server";

export type Work = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: "active" | "paused" | "done";
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
  color: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type ActivityEvent = {
  id: string;
  type: string;
  createdAt: string;
};

function toThing(row: {
  id: string;
  work_id: string;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  data: Record<string, unknown> | null;
}): Thing {
  const color = row.data && typeof row.data.color === "string" ? row.data.color : "blue";
  return {
    id: row.id,
    workId: row.work_id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    description: row.description,
    color,
  };
}

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("works")
    .select("id, slug, title, summary, status, created_at, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    summary: data.summary,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getThingsForWork(workId: string): Promise<Thing[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("things")
    .select("id, work_id, slug, name, type, description, data")
    .eq("work_id", workId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toThing);
}

export async function getThingBySlug(workId: string, thingSlug: string): Promise<Thing | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("things")
    .select("id, work_id, slug, name, type, description, data")
    .eq("work_id", workId)
    .eq("slug", thingSlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return toThing(data);
}

export async function getMessagesForWork(workId: string): Promise<Message[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("work_id", workId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function getRecentEventsForThing(thingId: string, limit = 5): Promise<ActivityEvent[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, type, created_at")
    .eq("thing_id", thingId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    createdAt: row.created_at,
  }));
}
