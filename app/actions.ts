"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

function required(formData: FormData, key: string, maxLength: number) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`${key} is required.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new Error(`${key} is too long.`);
  return normalized;
}

function optional(formData: FormData, key: string, maxLength: number) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) return null;
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new Error(`${key} is too long.`);
  return normalized;
}

function assertConfigured() {
  if (!isSupabaseConfigured()) throw new Error("Configure Supabase before creating or updating data.");
}

export type MessageActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function sendMessage(
  workId: string,
  workSlug: string,
  _previousState: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "메시지를 저장하려면 먼저 Supabase를 설정하세요." };
  }

  const content = formData.get("content");
  if (typeof content !== "string" || !content.trim()) {
    return { status: "error", message: "메시지를 입력하세요." };
  }
  if (content.trim().length > 10_000) {
    return { status: "error", message: "메시지는 10,000자 이하여야 해요." };
  }
  if (!/^[0-9a-f-]{36}$/i.test(workId) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workSlug)) {
    return { status: "error", message: "올바르지 않은 Work입니다." };
  }

  const { error } = await getSupabase().rpc("append_mock_conversation", {
    target_work_id: workId,
    user_content: content.trim(),
  });
  if (error) {
    console.error("Failed to append conversation", error.code);
    return { status: "error", message: "메시지를 저장하지 못했어요. 잠시 후 다시 시도하세요." };
  }

  revalidatePath(`/work/${workSlug}`);
  return { status: "success", message: "메시지가 저장되었어요." };
}

export async function createWork(formData: FormData) {
  assertConfigured();
  const title = required(formData, "title", 120);
  const summary = optional(formData, "summary", 500);
  const { data, error } = await getSupabase().rpc("create_work_with_event", { work_title: title, work_summary: summary });
  if (error) throw error;
  revalidatePath("/");
  redirect(`/work/${data}`);
}

export async function createThing(formData: FormData) {
  assertConfigured();
  const workId = required(formData, "workId", 36);
  const workSlug = required(formData, "workSlug", 140);
  const name = required(formData, "name", 80);
  const type = required(formData, "type", 40);
  const description = optional(formData, "description", 500);
  const { data, error } = await getSupabase().rpc("create_thing_with_event", { target_work_id: workId, thing_name: name, thing_type: type, thing_description: description, thing_data: {} });
  if (error) throw error;
  revalidatePath(`/work/${workSlug}`);
  redirect(`/work/${workSlug}/thing/${data}`);
}

export async function updateThing(formData: FormData) {
  assertConfigured();
  const workId = required(formData, "workId", 36);
  const workSlug = required(formData, "workSlug", 140);
  const thingId = required(formData, "thingId", 36);
  const thingSlug = required(formData, "thingSlug", 140);
  const type = required(formData, "type", 40);
  const description = optional(formData, "description", 500);
  const { error } = await getSupabase().rpc("update_thing_with_event", { target_work_id: workId, target_thing_id: thingId, thing_patch: { type, description } });
  if (error) throw error;
  revalidatePath(`/work/${workSlug}`);
  revalidatePath(`/work/${workSlug}/thing/${thingSlug}`);
}

export async function relateThings(formData: FormData) {
  assertConfigured();
  const workId = required(formData, "workId", 36);
  const workSlug = required(formData, "workSlug", 140);
  const thingSlug = required(formData, "thingSlug", 140);
  const fromThingId = required(formData, "fromThingId", 36);
  const toThingId = required(formData, "toThingId", 36);
  const relationType = required(formData, "relationType", 40);
  const { error } = await getSupabase().rpc("relate_things_with_event", { target_work_id: workId, source_thing_id: fromThingId, relation_type: relationType, destination_thing_id: toThingId, relation_metadata: {} });
  if (error) throw error;
  revalidatePath(`/work/${workSlug}/thing/${thingSlug}`);
}
