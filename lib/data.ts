import "server-only";
import { cache } from "react";
import { messages as mockMessages, things as mockThings, work as mockWork } from "@/lib/mock-data";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Event, Message, Relation, Thing, Work, WorkStatus } from "@/lib/types";

const colors = ["coral", "violet", "blue", "mint", "amber", "pink"];

function colorFor(value: string) {
  const total = [...value].reduce((sum, character) => sum + character.codePointAt(0)!, 0);
  return colors[total % colors.length];
}

function mapWork(row: Record<string, unknown>): Work {
  return { id: String(row.id), slug: String(row.slug), title: String(row.title), summary: row.summary ? String(row.summary) : null, status: row.status as WorkStatus, createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}

function mapThing(row: Record<string, unknown>): Thing {
  return { id: String(row.id), workId: String(row.work_id), slug: String(row.slug), name: String(row.name), type: String(row.type), description: row.description ? String(row.description) : null, data: (row.data ?? {}) as Record<string, unknown>, color: colorFor(String(row.id)), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}

function mapMessage(row: Record<string, unknown>): Message {
  return { id: String(row.id), workId: String(row.work_id), role: row.role as Message["role"], content: String(row.content), createdAt: String(row.created_at) };
}

function mapEvent(row: Record<string, unknown>): Event {
  return { id: String(row.id), workId: String(row.work_id), actorType: row.actor_type as Event["actorType"], actorId: row.actor_id ? String(row.actor_id) : null, type: String(row.type), payload: (row.payload ?? {}) as Record<string, unknown>, createdAt: String(row.created_at) };
}

export const listWorks = cache(async (): Promise<Work[]> => {
  if (!isSupabaseConfigured()) return [mockWork];
  const { data, error } = await getSupabase().from("works").select("*").eq("status", "active").order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map(mapWork);
});

export const getWorkBySlug = cache(async (slug: string): Promise<Work | null> => {
  if (!isSupabaseConfigured()) return slug === mockWork.slug ? mockWork : null;
  const { data, error } = await getSupabase().from("works").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? mapWork(data) : null;
});

export const listThings = cache(async (workId: string): Promise<Thing[]> => {
  if (!isSupabaseConfigured()) return workId === mockWork.id ? mockThings : [];
  const { data, error } = await getSupabase().from("things").select("*").eq("work_id", workId).order("created_at");
  if (error) throw error;
  return data.map(mapThing);
});

export const getThingBySlug = cache(async (workId: string, slug: string): Promise<Thing | null> => {
  if (!isSupabaseConfigured()) return mockThings.find((thing) => thing.workId === workId && thing.slug === slug) ?? null;
  const { data, error } = await getSupabase().from("things").select("*").eq("work_id", workId).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? mapThing(data) : null;
});

export const listMessages = cache(async (workId: string): Promise<Message[]> => {
  if (!isSupabaseConfigured()) return workId === mockWork.id ? mockMessages : [];
  const { data, error } = await getSupabase().from("messages").select("*").eq("work_id", workId).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data.map(mapMessage).reverse();
});

export const listRelatedThings = cache(async (workId: string, thingId: string): Promise<Thing[]> => {
  if (!isSupabaseConfigured()) return mockThings.filter((thing) => thing.id !== thingId).slice(0, 3);
  const supabase = getSupabase();
  const { data: relations, error } = await supabase.from("relations").select("*").eq("work_id", workId).or(`from_thing_id.eq.${thingId},to_thing_id.eq.${thingId}`);
  if (error) throw error;
  const ids = (relations as Record<string, unknown>[]).map((relation) => String(relation.from_thing_id) === thingId ? String(relation.to_thing_id) : String(relation.from_thing_id));
  if (!ids.length) return [];
  const { data, error: thingsError } = await supabase.from("things").select("*").eq("work_id", workId).in("id", ids);
  if (thingsError) throw thingsError;
  return data.map(mapThing);
});

export const listThingEvents = cache(async (workId: string, thingId: string): Promise<Event[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabase().from("events").select("*").eq("work_id", workId).contains("payload", { thing_id: thingId }).order("created_at", { ascending: false }).limit(5);
  if (error) throw error;
  return data.map(mapEvent);
});

export type { Relation };
