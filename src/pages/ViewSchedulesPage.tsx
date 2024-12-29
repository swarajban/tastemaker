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
import { Schedule, getSchedulesForUser } from '../lib/api/schedules';
import { supabase } from '../lib/supabaseClient';

export default function ViewSchedulesPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSchedules() {
      setLoading(true);
      try {
        const sessionResult = await supabase.auth.getSession();
        const userId = sessionResult.data?.session?.user?.id;
        if (!userId) {
          setLoading(false);
          return;
        }
        const data = await getSchedulesForUser(userId);
        setSchedules(data);
      } finally {
        setLoading(false);
      }
    }
    loadSchedules();
  }, []);

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
              <Text>Single schedule view for: {selectedScheduleId}</Text>
              // You’d typically display detailed day/meal info here or in a separate component.
            ) : (
              <Text>Select a schedule on the left to view</Text>
            )}
          </Box>
        </HStack>
      )}
    </Box>
  );
}
