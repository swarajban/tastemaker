import { supabase } from '../supabaseClient';
import { MealItemWithTags, getUserMealItemsWithTags } from '../api/mealItems';
import { ScheduleDay } from '../api/schedules';
import { GeneratedDay, GeneratedMeal } from './scheduleGenerator';

export async function transformScheduleDataToGeneratedDays(
  days: ScheduleDay[] // which includes schedule_meal rows
): Promise<GeneratedDay[]> {
  // 1) Get the user ID from the current session
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error fetching session:', error);
    return [];
  }

  if (!session?.user?.id) {
    console.warn('No user found in session; returning empty array');
    return [];
  }

  const userId = session.user.id;

  // 2) Fetch all meal items with tags for this user
  const allMealItems: MealItemWithTags[] = await getUserMealItemsWithTags(userId);

  // 3) Transform each schedule_day (which has schedule_meal rows)
  //    into the same shape as our "GeneratedDay"
  return days.map((day) => {
    const generatedMeals: GeneratedMeal[] = day.schedule_meal.map((m) => {
      const mainItemInfo =
        allMealItems.find((i) => i.id === m.main_item_id) ||
        // Fallback with required properties
        {
          id: m.main_item_id,
          title: 'Unknown',
          tags: [],
          type: 'main',
          effort: 1,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

      const sideItemInfo =
        allMealItems.find((i) => i.id === m.side_item_id) ||
        // Fallback with required properties
        {
          id: m.side_item_id,
          title: 'Unknown',
          tags: [],
          type: 'side',
          effort: 1,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

      return {
        mealType: m.meal_type,
        mainItem: mainItemInfo,
        sideItem: sideItemInfo,
      };
    });

    return {
      date: day.day_date,
      meals: generatedMeals,
    };
  });
} 