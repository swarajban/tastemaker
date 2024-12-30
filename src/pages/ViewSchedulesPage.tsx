import React, { useEffect, useState } from 'react';
import {
  Heading,
  Box,
  VStack,
  Text,
  Button,
  Spinner,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Schedule, getSchedulesForUser, getScheduleById } from '../lib/api/schedules';
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
                bg={sched.id === selectedScheduleId ? 'gray.100' : 'white'}
                onClick={() => handleSelectSchedule(sched.id)}
                cursor="pointer"
              >
                <Text fontWeight="bold">
                  {sched.start_date} - {sched.end_date}
                </Text>
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
                    <ScheduleDetail days={selectedScheduleDays} />
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
