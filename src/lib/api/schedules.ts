import { supabase } from '../supabaseClient';

export interface Schedule {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface ScheduleDay {
  id: string;
  schedule_id: string;
  day_date: string;
  schedule_meal: ScheduleMeal[];
}

export interface ScheduleMeal {
  id: string;
  schedule_day_id: string;
  meal_type: 'lunch' | 'dinner';
  main_item_id: string;
  side_item_id: string;
}

export async function createSchedule(
  userId: string,
  startDate: string,
  endDate: string,
  dayMeals: {
    dayDate: string;
    meals: Array<{
      mealType: 'lunch' | 'dinner';
      mainItemId: string;
      sideItemId: string;
    }>;
  }[]
): Promise<string> {
  console.log('Creating schedule with:', { userId, startDate, endDate, dayMeals });

  // 1) Create the schedule
  const { data: scheduleData, error: scheduleError } = await supabase
    .from('schedule')
    .insert({
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
    })
    .select()
    .single();

  if (scheduleError) {
    console.error('Error creating schedule:', scheduleError);
    throw scheduleError;
  }
  console.log('Created schedule:', scheduleData);

  const scheduleId = scheduleData.id;

  // 2) Create schedule_day rows
  for (const day of dayMeals) {
    console.log('Creating day:', day);
    const { data: dayData, error: dayError } = await supabase
      .from('schedule_day')
      .insert({
        schedule_id: scheduleId,
        day_date: day.dayDate,
      })
      .select()
      .single();

    if (dayError) {
      console.error('Error creating schedule day:', dayError);
      throw dayError;
    }
    console.log('Created day:', dayData);

    // 3) Create schedule_meal rows
    for (const meal of day.meals) {
      console.log('Creating meal:', meal);
      const { error: mealError } = await supabase
        .from('schedule_meal')
        .insert({
          schedule_day_id: dayData.id,
          meal_type: meal.mealType,
          main_item_id: meal.mainItemId,
          side_item_id: meal.sideItemId,
        });

      if (mealError) {
        console.error('Error creating schedule meal:', mealError);
        throw mealError;
      }
      console.log('Created meal successfully');
    }
  }

  return scheduleId;
}

export async function getSchedulesForUser(userId: string): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from('schedule')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getScheduleById(scheduleId: string) {
  const { data: scheduleData, error } = await supabase
    .from('schedule')
    .select('*')
    .eq('id', scheduleId)
    .single();
  if (error) throw error;

  // fetch schedule days + meals
  const { data: dayData, error: dayError } = await supabase
    .from('schedule_day')
    .select('*, schedule_meal(*)')
    .eq('schedule_id', scheduleId)
    .order('day_date');
  if (dayError) throw dayError;

  return { schedule: scheduleData, days: dayData };
}

export async function deleteSchedule(scheduleId: string) {
  const { error } = await supabase
    .from('schedule')
    .delete()
    .eq('id', scheduleId);
  if (error) throw error;
}
