import React, { useEffect, useState } from 'react';
import {
  Heading,
  Box,
  VStack,
  Text,
  Button,
  Spinner,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Schedule, getSchedulesForUser, getScheduleById, updateScheduleMeal, deleteScheduleMeal, addScheduleMeal, deleteSchedule } from '../lib/api/schedules';
import { supabase } from '../lib/supabaseClient';
import ScheduleDetail from '../components/schedule/ScheduleDetail';
import { GeneratedDay } from '../lib/util/scheduleGenerator';
import { transformScheduleDataToGeneratedDays } from '../lib/util/scheduleDataTransform';

export default function ViewSchedulesPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  const [selectedScheduleDays, setSelectedScheduleDays] = useState<GeneratedDay[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deletingMeal, setDeletingMeal] = useState(false);

  useEffect(() => {
    async function loadSchedules() {
      setLoading(true);
      try {
        const sessionResult = await supabase.auth.getSession();
        const userId = sessionResult.data?.session?.user?.id;
        if (!userId) return;
        const data = await getSchedulesForUser(userId);
        setSchedules(data);
      } finally {
        setLoading(false);
      }
    }
    loadSchedules();
  }, []);

  useEffect(() => {
    async function loadScheduleDetail() {
      if (!selectedScheduleId) return;
      setLoadingDetail(true);
      try {
        const { schedule, days } = await getScheduleById(selectedScheduleId);

        const newDays = await transformScheduleDataToGeneratedDays(days);

        setSelectedScheduleDays(newDays);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetail(false);
      }
    }
    loadScheduleDetail();
  }, [selectedScheduleId]);

  const handleSelectSchedule = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
  };

  const handleCreateSchedule = () => {
    navigate('/create-schedule');
  };

  const handleMealUpdate = async (dayDate: string, mealType: 'lunch' | 'dinner', mainItemId: string, sideItemId: string) => {
    if (!selectedScheduleId) return;

    try {
      // Find the schedule_day for this date
      const { data: dayData } = await supabase
        .from('schedule_day')
        .select('id')
        .eq('schedule_id', selectedScheduleId)
        .eq('day_date', dayDate)
        .single();

      if (!dayData) throw new Error('Schedule day not found');

      // Update the meal
      await updateScheduleMeal(dayData.id, mealType, mainItemId, sideItemId);

      // Reload the schedule detail
      const { schedule, days } = await getScheduleById(selectedScheduleId);
      const newDays = await transformScheduleDataToGeneratedDays(days);
      setSelectedScheduleDays(newDays);
    } catch (err) {
      console.error('Error updating meal:', err);
    }
  };

  const handleMealDelete = async (dayDate: string, mealType: 'lunch' | 'dinner') => {
    if (!selectedScheduleId) return;

    setDeletingMeal(true);
    try {
      // Find the schedule_day for this date
      const { data: dayData } = await supabase
        .from('schedule_day')
        .select('id')
        .eq('schedule_id', selectedScheduleId)
        .eq('day_date', dayDate)
        .single();

      if (!dayData) throw new Error('Schedule day not found');

      // Delete the meal
      await deleteScheduleMeal(dayData.id, mealType);

      // Reload the schedule detail
      const { schedule, days } = await getScheduleById(selectedScheduleId);
      const newDays = await transformScheduleDataToGeneratedDays(days);
      setSelectedScheduleDays(newDays);
    } catch (err) {
      console.error('Error deleting meal:', err);
    } finally {
      setDeletingMeal(false);
    }
  };

  const handleMealAdd = async (dayDate: string, mealType: 'lunch' | 'dinner', mainItemId: string, sideItemId: string) => {
    if (!selectedScheduleId) return;

    try {
      // Find the schedule_day for this date
      const { data: dayData } = await supabase
        .from('schedule_day')
        .select('id')
        .eq('schedule_id', selectedScheduleId)
        .eq('day_date', dayDate)
        .single();

      if (!dayData) throw new Error('Schedule day not found');

      // Add the new meal
      await addScheduleMeal(dayData.id, mealType, mainItemId, sideItemId);

      // Reload the schedule detail
      const { schedule, days } = await getScheduleById(selectedScheduleId);
      const newDays = await transformScheduleDataToGeneratedDays(days);
      setSelectedScheduleDays(newDays);
    } catch (err) {
      console.error('Error adding meal:', err);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the schedule selection
    try {
      await deleteSchedule(scheduleId);
      
      // Remove from local state
      setSchedules(schedules.filter(s => s.id !== scheduleId));
      // Clear selection if deleted schedule was selected
      if (selectedScheduleId === scheduleId) {
        setSelectedScheduleId(null);
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}`;
  };

  return (
    <Box p={4}>
      <Heading mb={4}>Your Schedules</Heading>
      <Button onClick={handleCreateSchedule} colorScheme="teal" mb={4}>
        Create New Schedule
      </Button>

      {loading ? (
        <Spinner />
      ) : (
        <HStack align="start">
          <VStack align="start" spacing={2} w="300px" overflowY="auto">
            {schedules.map((sched) => (
              <Box
                key={sched.id}
                p={2}
                borderWidth={1}
                borderRadius="md"
                bg={sched.id === selectedScheduleId 
                  ? useColorModeValue('gray.200', 'gray.600')
                  : useColorModeValue('white', 'gray.700')}
                onClick={() => handleSelectSchedule(sched.id)}
                cursor="pointer"
                w="100%"
              >
                <HStack justify="space-between" width="100%">
                  <Text 
                    fontWeight="bold" 
                    color={useColorModeValue('gray.800', 'white')}
                  >
                    {formatDateRange(sched.start_date, sched.end_date)}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={(e) => handleDeleteSchedule(sched.id, e)}
                  >
                    Delete
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>

          <Box flex="1" p={4} borderWidth={1} borderRadius="md">
            {selectedScheduleId ? (
              loadingDetail ? (
                <Spinner />
              ) : (
                <>
                  {selectedScheduleDays.length === 0 && (
                    <Text>No meals found for this schedule.</Text>
                  )}
                  {selectedScheduleDays.length > 0 && (
                    <ScheduleDetail 
                      days={selectedScheduleDays} 
                      onMealUpdate={handleMealUpdate}
                      onMealDelete={handleMealDelete}
                      onMealAdd={handleMealAdd}
                      isDeleting={deletingMeal}
                    />
                  )}
                </>
              )
            ) : (
              <Text>Select a schedule on the left to view</Text>
            )}
          </Box>
        </HStack>
      )}
    </Box>
  );
}
