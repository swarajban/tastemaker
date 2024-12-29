// src/lib/api/userPreferences.ts
import { supabase } from '../supabaseClient';

export interface UserPreferences {
  id: string;
  user_id: string;
  tag_restrictions: string[][]; 
  // e.g. [["beans"], ["pork"]] => means "beans" can't appear twice in one day, "pork" can't appear twice, etc.
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // If the user hasn't set preferences, you might return null or a default
    return null;
  }
  return data as UserPreferences;
}
