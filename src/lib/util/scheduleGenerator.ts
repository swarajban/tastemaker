// src/lib/util/scheduleGenerator.ts
import { getUserMealItemsWithTags, MealItemWithTags } from '../api/mealItems';
import { getUserPreferences } from '../api/userPreferences';

/**
 * Each meal we create includes a main and side item
 */
export interface GeneratedMeal {
  mealType: 'lunch' | 'dinner';
  mainItem: MealItemWithTags;
  sideItem: MealItemWithTags;
}

/**
 * Each day has a date string + array of meals
 */
export interface GeneratedDay {
  date: string;
  meals: GeneratedMeal[];
}

/**
 * A simple interface for controlling schedule generation
 * (potentially from user_preferences or user input)
 */
export interface SchedulePreferences {
  tagRestrictions: string[][]; 
  // e.g. [["beans"], ["pork"]] => means "beans" can't appear twice in the same day, "pork" can't appear twice, etc.
  // If the user has more complex restrictions, you might represent them differently.
}

/**
 * Main function to generate a schedule.
 * 1) loads meal items + user prefs from Supabase
 * 2) enforces constraints
 * 3) returns an array of GeneratedDay
 */
export async function generateSchedule(
  userId: string,
  dateRange: string[], // e.g. ["2024-01-01", "2024-01-02", ...]
  dayMealSlots: Record<string, Array<'lunch' | 'dinner'>> // which meals to schedule per day
): Promise<GeneratedDay[]> {
  // 1) Fetch meal items + tags
  const allItems = await getUserMealItemsWithTags(userId);
  const mains = allItems.filter((i) => i.type === 'main');
  const sides = allItems.filter((i) => i.type === 'side');

  // 2) Fetch user prefs
  const prefs = await getUserPreferences(userId);
  const schedulePrefs: SchedulePreferences = {
    tagRestrictions: prefs?.tag_restrictions || [],
  };

  // We'll keep track of usage counts: itemId -> number of times used
  const usageCounts = new Map<string, number>();

  // For enforcing "no more than one meal of a restricted tag per day",
  // we'll track which restricted tags have been used each day
  // dayUsedTags[day][tagName] = count on that day
  const dayUsedTags: Record<string, Record<string, number>> = {};

  // Initialize the result array
  const schedule: GeneratedDay[] = [];

  // 3) Generate the schedule day by day
  for (const day of dateRange) {
    const mealSlots = dayMealSlots[day] || [];
    const generatedMeals: GeneratedMeal[] = [];

    // Make sure we have a record for dayUsedTags
    dayUsedTags[day] = {};

    for (const mealType of mealSlots) {
      // 3.1) Pick a main
      const mainItem = pickItem(mains, usageCounts, dayUsedTags[day], schedulePrefs);
      if (!mainItem) {
        // If we fail to pick a main, skip or handle logic (in real code, you might handle it differently)
        continue;
      }

      // 3.2) Pick a side
      const sideItem = pickItem(sides, usageCounts, dayUsedTags[day], schedulePrefs);
      if (!sideItem) {
        // If we fail to pick a side, skip or handle logic
        continue;
      }

      // 3.3) Record usage
      incrementUsage(usageCounts, mainItem.id);
      incrementUsage(usageCounts, sideItem.id);
      updateDayUsedTags(dayUsedTags[day], mainItem.tags);
      updateDayUsedTags(dayUsedTags[day], sideItem.tags);

      generatedMeals.push({
        mealType,
        mainItem,
        sideItem,
      });
    }

    schedule.push({
      date: day,
      meals: generatedMeals,
    });
  }

  return schedule;
}

/**
 * Helper function to pick an item from a candidate list that:
 * - Minimizes or spreads usage (we do a "greedy + random" approach)
 * - Doesn't violate "no more than one meal of restricted tag per day"
 */
function pickItem(
  candidates: MealItemWithTags[],
  usageCounts: Map<string, number>,
  dayTagsUsed: Record<string, number>,
  prefs: SchedulePreferences
): MealItemWithTags | null {
  // 1) Filter out items whose restricted tags are already used up today
  const filtered = candidates.filter((item) => {
    // For each restricted tag group (like ["beans"]), that means "don't use that tag more than once a day"
    // So if item.tags includes "beans", we check if dayTagsUsed["beans"] >= 1
    for (const restriction of prefs.tagRestrictions) {
      // If restriction is ["beans"], then if item has "beans" 
      // we check if dayTagsUsed["beans"] is already >=1
      // This example assumes each restriction array has only 1 tag inside it,
      // as you indicated. If it had multiple, you'd interpret it differently.
      const restrictedTag = restriction[0];
      if (item.tags.includes(restrictedTag)) {
        const usageSoFar = dayTagsUsed[restrictedTag] || 0;
        if (usageSoFar >= 1) {
          return false; // can't use this item
        }
      }
    }
    return true;
  });

  if (filtered.length === 0) {
    return null; // no valid item
  }

  // 2) We want to pick the item that's used the least so far, but with a bit of randomness
  // Sort by usage count ascending
  const sorted = filtered.sort((a, b) => {
    const usageA = usageCounts.get(a.id) || 0;
    const usageB = usageCounts.get(b.id) || 0;
    return usageA - usageB;
  });

  // We'll take the top N% least used items, then pick randomly among them
  // e.g., take the top 20% or so. Let's do a small approach:
  const sliceSize = Math.max(1, Math.floor(sorted.length * 0.2));
  const topCandidates = sorted.slice(0, sliceSize);
  const randomIndex = Math.floor(Math.random() * topCandidates.length);
  return topCandidates[randomIndex];
}

/**
 * Increment usage count in a Map
 */
function incrementUsage(usage: Map<string, number>, itemId: string) {
  const current = usage.get(itemId) || 0;
  usage.set(itemId, current + 1);
}

/**
 * Update dayUsedTags for any restricted tags an item has.
 */
function updateDayUsedTags(dayTagsUsed: Record<string, number>, itemTags: string[]) {
  // If an item has a tag that's in the user restrictions, increment usage
  // For simplicity, we'll increment for *all* tags, 
  // but you can filter to only those in user preferences
  for (const t of itemTags) {
    if (!dayTagsUsed[t]) {
      dayTagsUsed[t] = 0;
    }
    dayTagsUsed[t] += 1;
  }
}
