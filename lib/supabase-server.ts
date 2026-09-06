import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

let client: SupabaseClient<Database> | null = null;

/**
 * Service-role Supabase client for server-only use (route handlers, server
 * components). Never import this from client code — the key must not reach
 * the browser bundle. Row Level Security has no policies on any table, so
 * only the service role (which bypasses RLS) can read or write.
 */
export function getSupabaseServerClient() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  client = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return client;
}
