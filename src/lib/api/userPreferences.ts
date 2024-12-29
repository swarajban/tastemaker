// src/lib/api/userPreferences.ts
import { supabase } from '../supabaseClient';

export interface UserPreferences {
  id: string;
  user_id: string;
  tag_restrictions: string[][]; 
  // e.g. [["beans"], ["pork"]] => means "beans" can't appear twice in one day, "pork" can't appear twice, etc.
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  // First try to get existing preferences
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  // If found, return the data
  if (data) {
    return data as UserPreferences;
  }

  // If not found, create default preferences
  const defaultPreferences: Omit<UserPreferences, 'id'> = {
    user_id: userId,
    tag_restrictions: [], // Default to empty restrictions
  };

  const { data: newData, error: insertError } = await supabase
    .from('user_preferences')
    .insert(defaultPreferences)
    .select()
    .single();

  if (insertError || !newData) {
    console.error('Error creating user preferences:', insertError);
    return null;
  }

  return newData as UserPreferences;
}
