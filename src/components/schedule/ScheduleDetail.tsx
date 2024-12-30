import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { GeneratedDay } from '../../lib/util/scheduleGenerator';

interface ScheduleDetailProps {
  days: GeneratedDay[];
}

export default function ScheduleDetail({ days }: ScheduleDetailProps) {
  return (
    <VStack align="start" spacing={4}>
      {days.map((day) => (
        <Box key={day.date} p={2} borderWidth={1} borderRadius="md" width="100%">
          <Text fontWeight="bold">
            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })} – {day.date}
          </Text>
          {day.meals.map((meal) => (
            <Text key={meal.mealType}>
              {meal.mealType.toUpperCase()}: {meal.mainItem.title} + {meal.sideItem.title}
            </Text>
          ))}
        </Box>
      ))}
    </VStack>
  );
} 