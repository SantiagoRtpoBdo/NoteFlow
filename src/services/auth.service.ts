import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data as Profile | null;
}

export async function updateProfile(
  userId: string,
  updates: { full_name?: string; avatar_url?: string },
): Promise<Profile | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .update(updates as Record<string, unknown>)
    .eq("id", userId)
    .select()
    .single();

  return data as Profile | null;
}
