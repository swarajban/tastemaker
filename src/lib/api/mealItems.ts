import { supabase } from '../supabaseClient';

export interface MealItem {
  id: string;
  user_id: string;
  title: string;
  notes?: string;
  type: 'main' | 'side';
  effort: number; // 1-3
  created_at: string;
  updated_at: string;
}

export async function getUserMealItems(userId: string): Promise<MealItem[]> {
  const { data, error } = await supabase
    .from('meal_item')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');
  if (error) throw error;
  return data || [];
}

export async function createMealItem(
  userId: string,
  {
    title,
    notes,
    type,
    effort,
  }: {
    title: string;
    notes?: string;
    type: 'main' | 'side';
    effort: number;
  },
  tagIds: string[]
): Promise<MealItem> {
  // 1) Insert the meal item
  const { data: mealItemData, error: mealItemError } = await supabase
    .from('meal_item')
    .insert({
      user_id: userId,
      title,
      notes,
      type,
      effort,
    })
    .single();

  if (mealItemError) throw mealItemError;

  // 2) Insert into meal_item_tag if needed
  if (tagIds.length > 0) {
    const mealItemTags = tagIds.map((tagId) => ({
      meal_item_id: mealItemData.id,
      tag_id: tagId,
    }));
    const { error: mealItemTagError } = await supabase
      .from('meal_item_tag')
      .insert(mealItemTags);

    if (mealItemTagError) throw mealItemTagError;
  }

  return mealItemData;
}

export async function updateMealItem(
  mealItemId: string,
  {
    title,
    notes,
    type,
    effort,
  }: {
    title: string;
    notes?: string;
    type: 'main' | 'side';
    effort: number;
  },
  tagIds: string[]
) {
  // Update the item
  const { data: updatedItem, error } = await supabase
    .from('meal_item')
    .update({
      title,
      notes,
      type,
      effort,
      updated_at: new Date().toISOString(),
    })
    .eq('id', mealItemId)
    .single();
  if (error) throw error;

  // Clear existing tags
  await supabase.from('meal_item_tag').delete().eq('meal_item_id', mealItemId);

  // Insert new tags
  if (tagIds.length > 0) {
    const mealItemTags = tagIds.map((tagId) => ({
      meal_item_id: mealItemId,
      tag_id: tagId,
    }));
    await supabase.from('meal_item_tag').insert(mealItemTags);
  }

  return updatedItem;
}

export async function deleteMealItem(mealItemId: string): Promise<void> {
  const { error } = await supabase
    .from('meal_item')
    .delete()
    .eq('id', mealItemId);
  if (error) throw error;
}



// This type helps represent a meal item + its associated tags
export interface MealItemWithTags extends MealItem {
    tags: string[]; 
  }
  
  export async function getUserMealItemsWithTags(userId: string): Promise<MealItemWithTags[]> {
    // Using Supabase's "foreign tables" approach with 'meal_item_tag(tag_id(*))' 
    // or you can do it with multiple queries. 
    // Example here: we can do a single query with a "many-to-many" approach if we do an RPC or use Supabase's "eq" + "in".
    // 
    // A simpler approach might be:
    
    const { data, error } = await supabase
      .from('meal_item')
      .select(`
        *,
        meal_item_tag (
          tag_id
        )
      `)
      .eq('user_id', userId);
  
    if (error) throw error;
    if (!data) return [];
  
    // data is an array of meal_items, each with a nested array meal_item_tag
    // We'll fetch the actual tag names from `tag` table next, or do a second query.
  
    // Step 1: collect all tag_ids from the result
    const tagIds = new Set<string>();
    data.forEach((mi: any) => {
      mi.meal_item_tag.forEach((mt: any) => tagIds.add(mt.tag_id));
    });
  
    // Step 2: get the tag name for each tag_id
    let tagMap: Record<string, string> = {};
    if (tagIds.size > 0) {
      const { data: tagData, error: tagError } = await supabase
        .from('tag')
        .select('*')
        .in('id', Array.from(tagIds));
      if (tagError) throw tagError;
  
      tagData?.forEach((t) => {
        tagMap[t.id] = t.name;
      });
    }
  
    // Step 3: build the final array of MealItemWithTags
    return data.map((mi: any) => {
      const tags = mi.meal_item_tag.map((mt: any) => tagMap[mt.tag_id]).filter(Boolean);
      return {
        ...mi,
        tags,
      };
    });
  }
  