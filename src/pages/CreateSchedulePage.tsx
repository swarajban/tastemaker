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
  Input,
  Checkbox
} from '@chakra-ui/react';
import { supabase } from '../lib/supabaseClient';
import { createSchedule } from '../lib/api/schedules';
import { generateSchedule, GeneratedDay } from '../lib/util/scheduleGenerator';
import { getUserPreferences, UserPreferences } from '../lib/api/userPreferences';
import { Tag, getUserTags } from '../lib/api/tags';
import ScheduleDetail from '../components/schedule/ScheduleDetail';
import { useNavigate } from 'react-router-dom';
import { getUserMealItemsWithTags } from '../lib/api/mealItems';

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

  const [userPrefs, setUserPrefs] = useState<UserPreferences | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

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

  useEffect(() => {
    async function loadTagData() {
      const sessionResult = await supabase.auth.getSession();
      const userId = sessionResult.data?.session?.user?.id;
      if (!userId) return;

      // Load user preferences
      const prefs = await getUserPreferences(userId);
      setUserPrefs(prefs);

      // Load available tags
      const tags = await getUserTags(userId);
      setAvailableTags(tags);
    }
    loadTagData();
  }, []);

  const handleToggleTagRestriction = async (tagName: string) => {
    if (!userPrefs) return;

    const sessionResult = await supabase.auth.getSession();
    const userId = sessionResult.data?.session?.user?.id;
    if (!userId) return;

    // Check if this tag is already restricted
    const isCurrentlyRestricted = userPrefs.tag_restrictions.includes(tagName);

    // Create new restrictions array
    let newRestrictions: string[];
    if (isCurrentlyRestricted) {
      // Remove the restriction
      newRestrictions = userPrefs.tag_restrictions.filter(tag => tag !== tagName);
    } else {
      // Add the restriction
      newRestrictions = [...userPrefs.tag_restrictions, tagName];
    }

    // Update in Supabase
    const { data, error } = await supabase
      .from('user_preferences')
      .update({ tag_restrictions: newRestrictions })
      .eq('user_id', userId)
      .select()
      .single();

    if (!error && data) {
      setUserPrefs(data);
    }
  };

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

    setIsSaving(true);
    try {
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
      
      // Navigate to view schedules page after successful save
      navigate('/schedules');
    } catch (error) {
      console.error('Error saving schedule:', error);
      // You might want to show an error toast/message to the user here
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewMealUpdate = async (
    dayDate: string,
    mealType: 'lunch' | 'dinner',
    mainItemId: string,
    sideItemId: string
  ) => {
    // Get the new meal items
    const sessionResult = await supabase.auth.getSession();
    const userId = sessionResult.data?.session?.user?.id;
    if (!userId) return;

    const items = await getUserMealItemsWithTags(userId);
    const mainItem = items.find(item => item.id === mainItemId);
    const sideItem = items.find(item => item.id === sideItemId);

    if (!mainItem || !sideItem) return;

    // Update the preview state
    setPreview(prevPreview => 
      prevPreview.map(day => {
        if (day.date === dayDate) {
          return {
            ...day,
            meals: day.meals.map(meal => {
              if (meal.mealType === mealType) {
                return {
                  ...meal,
                  mainItem,
                  sideItem,
                };
              }
              return meal;
            }),
          };
        }
        return day;
      })
    );
  };

  const handlePreviewMealDelete = async (dayDate: string, mealType: 'lunch' | 'dinner') => {
    setPreview(prevPreview => 
      prevPreview.map(day => {
        if (day.date === dayDate) {
          return {
            ...day,
            meals: day.meals.filter(meal => meal.mealType !== mealType)
          };
        }
        return day;
      })
    );
  };

  const handlePreviewMealAdd = async (
    dayDate: string,
    mealType: 'lunch' | 'dinner',
    mainItemId: string,
    sideItemId: string
  ) => {
    // Get the new meal items
    const sessionResult = await supabase.auth.getSession();
    const userId = sessionResult.data?.session?.user?.id;
    if (!userId) return;

    const items = await getUserMealItemsWithTags(userId);
    const mainItem = items.find(item => item.id === mainItemId);
    const sideItem = items.find(item => item.id === sideItemId);

    if (!mainItem || !sideItem) return;

    setPreview(prevPreview => 
      prevPreview.map(day => {
        if (day.date === dayDate) {
          return {
            ...day,
            meals: [...day.meals, {
              mealType,
              mainItem,
              sideItem
            }]
          };
        }
        return day;
      })
    );
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

      {/* Tag Restrictions */}
      <Box mt={6}>
        <Text fontWeight="bold" mb={2}>Tag Restrictions</Text>
        <Text fontSize="sm" color="gray.600" mb={4}>
          Select tags that should not appear more than once per day
        </Text>
        
        <VStack align="start" spacing={2}>
          {availableTags.map((tag) => {
            const isRestricted = userPrefs?.tag_restrictions.includes(tag.name);
            
            return (
              <Checkbox
                key={tag.id}
                isChecked={isRestricted}
                onChange={() => handleToggleTagRestriction(tag.name)}
              >
                {tag.name}
              </Checkbox>
            );
          })}
        </VStack>
      </Box>

      <Button onClick={handlePreview} colorScheme="blue" mt={4}>
        Preview Schedule
      </Button>

      {preview.length > 0 && (
        <Box mt={4}>
          <Heading size="md" mb={2}>Preview</Heading>
          <ScheduleDetail 
            days={preview} 
            onMealUpdate={handlePreviewMealUpdate}
            onMealDelete={handlePreviewMealDelete}
            onMealAdd={handlePreviewMealAdd}
          />
        </Box>
      )}

      <Button 
        onClick={handleSave} 
        colorScheme="teal" 
        mt={4}
        isLoading={isSaving}
        loadingText="Saving..."
        isDisabled={preview.length === 0 || isSaving}
      >
        Save Schedule
      </Button>
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
