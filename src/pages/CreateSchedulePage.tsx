// src/pages/CreateSchedulePage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Button,
  VStack,
  Text,
  FormControl,
  FormLabel,
  Input
} from '@chakra-ui/react';
import { supabase } from '../lib/supabaseClient';
import { createSchedule } from '../lib/api/schedules';
import { generateSchedule, GeneratedDay } from '../lib/util/scheduleGenerator';

export default function CreateSchedulePage() {
  const nextMonday = getNextMonday();
  const nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextSunday.getDate() + 6);
  const endDateStr = nextSunday.toISOString().split('T')[0]; // Format as YYYY-MM-DD

  const [startDate, setStartDate] = useState(nextMonday);
  const [endDate, setEndDate] = useState(endDateStr);

  // For each date, which meal slots we want (lunch/dinner)
  const [dayMealSlots, setDayMealSlots] = useState<Record<string, Array<'lunch' | 'dinner'>>>({});

  const [preview, setPreview] = useState<GeneratedDay[]>([]);

  useEffect(() => {
    const daySlots: Record<string, Array<'lunch' | 'dinner'>> = {};
    const dateRange = getDateRange(startDate, endDate);
    for (const d of dateRange) {
      const dayOfWeek = new Date(d).getDay(); // 0=Sunday, 6=Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend => lunch + dinner
        daySlots[d] = ['lunch', 'dinner'];
      } else {
        // Weekday => dinner only
        daySlots[d] = ['dinner'];
      }
    }
    setDayMealSlots(daySlots);
  }, [startDate, endDate]);

  const handlePreview = async () => {
    const sessionResult = await supabase.auth.getSession();
    const userId = sessionResult.data?.session?.user?.id;
    if (!userId) return;

    const dateRange = getDateRange(startDate, endDate);

    // 1) Generate the schedule (this automatically fetches meal items & user prefs)
    const result = await generateSchedule(userId, dateRange, dayMealSlots);
    setPreview(result);
  };

  const handleSave = async () => {
    if (preview.length === 0) return;

    const sessionResult = await supabase.auth.getSession();
    const userId = sessionResult.data?.session?.user?.id;
    if (!userId) return;

    // Transform preview into data shape for createSchedule
    const dayMeals = preview.map((day) => ({
      dayDate: day.date,
      meals: day.meals.map((m) => ({
        mealType: m.mealType,
        mainItemId: m.mainItem.id,
        sideItemId: m.sideItem.id,
      })),
    }));

    const scheduleId = await createSchedule(userId, startDate, endDate, dayMeals);
    console.log('Created schedule:', scheduleId);
    // Optionally navigate away
  };

  return (
    <Box p={4}>
      <Heading>Create Schedule</Heading>

      {/* Simple form for date inputs */}
      <FormControl mt={4} maxW="300px">
        <FormLabel>Start Date</FormLabel>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </FormControl>
      <FormControl mt={4} maxW="300px">
        <FormLabel>End Date</FormLabel>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </FormControl>

      <Button onClick={handlePreview} colorScheme="blue" mt={4}>
        Preview Schedule
      </Button>

      {preview.length > 0 && (
        <VStack mt={4} align="start">
          {preview.map((day) => (
            <Box key={day.date} p={2} borderWidth={1} borderRadius="md" w="100%">
              <Text fontWeight="bold">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })} - {day.date}
              </Text>
              {day.meals.map((meal) => (
                <Text key={meal.mealType}>
                  {meal.mealType.toUpperCase()}:
                  {' '}
                  {meal.mainItem.title} + {meal.sideItem.title}
                </Text>
              ))}
            </Box>
          ))}
          <Button onClick={handleSave} colorScheme="teal">
            Save Schedule
          </Button>
        </VStack>
      )}
    </Box>
  );
}

/** 
 * Utility: get all dates between start and end (inclusive) in YYYY-MM-DD format.
 */
function getDateRange(start: string, end: string): string[] {
  const result: string[] = [];
  let current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    result.push(`${yyyy}-${mm}-${dd}`);
    current.setDate(current.getDate() + 1);
  }

  return result;
}

function getNextMonday(): string {
  const today = new Date();
  const daysUntilMonday = (8 - today.getDay()) % 7; // Days until next Monday (1=Monday, so we use 8)
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  
  // Format as YYYY-MM-DD
  const yyyy = nextMonday.getFullYear();
  const mm = String(nextMonday.getMonth() + 1).padStart(2, '0');
  const dd = String(nextMonday.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
