import { supabase } from '../supabaseClient';

export interface Tag {
  id: string;
  user_id: string;
  name: string;
}

// Fetch all tags for a user
export async function getUserTags(userId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tag')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  if (error) throw error;
  return data || [];
}

// Create a new tag
export async function createTag(userId: string, name: string): Promise<Tag> {
  const { data, error } = await supabase
    .from('tag')
    .insert({ user_id: userId, name })
    .single();
  if (error) throw error;
  return data;
}
