import React, { useState } from 'react';
import { Box, Text, VStack, Button, useDisclosure, HStack } from '@chakra-ui/react';
import { GeneratedDay } from '../../lib/util/scheduleGenerator';
import MealSelector from './MealSelector';

interface ScheduleDetailProps {
  days: GeneratedDay[];
  onMealUpdate?: (dayDate: string, mealType: 'lunch' | 'dinner', mainItemId: string, sideItemId: string) => Promise<void>;
  onMealDelete?: (dayDate: string, mealType: 'lunch' | 'dinner') => Promise<void>;
  readOnly?: boolean;
}

export default function ScheduleDetail({ 
  days, 
  onMealUpdate, 
  onMealDelete,
  readOnly = false 
}: ScheduleDetailProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<'lunch' | 'dinner' | null>(null);
  const [currentMainId, setCurrentMainId] = useState<string | null>(null);
  const [currentSideId, setCurrentSideId] = useState<string | null>(null);

  const handleEditMeal = (dayDate: string, mealType: 'lunch' | 'dinner', mainId: string, sideId: string) => {
    setSelectedDay(dayDate);
    setSelectedMealType(mealType);
    setCurrentMainId(mainId);
    setCurrentSideId(sideId);
    onOpen();
  };

  const handleMealSelected = async (mainItemId: string, sideItemId: string) => {
    if (selectedDay && selectedMealType && onMealUpdate) {
      await onMealUpdate(selectedDay, selectedMealType, mainItemId, sideItemId);
      onClose();
    }
  };

  const handleDeleteMeal = async (dayDate: string, mealType: 'lunch' | 'dinner') => {
    if (onMealDelete) {
      await onMealDelete(dayDate, mealType);
    }
  };

  return (
    <>
      <VStack align="start" spacing={4}>
        {days.map((day) => (
          <Box key={day.date} p={2} borderWidth={1} borderRadius="md" width="100%">
            <Text fontWeight="bold">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })} – {day.date}
            </Text>
            {day.meals.map((meal) => (
              <Box key={meal.mealType} display="flex" alignItems="center" mt={1}>
                <Text flex="1">
                  {meal.mealType.toUpperCase()}: {meal.mainItem.title} + {meal.sideItem.title}
                </Text>
                {!readOnly && (
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleEditMeal(day.date, meal.mealType, meal.mainItem.id, meal.sideItem.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDeleteMeal(day.date, meal.mealType)}
                    >
                      Remove
                    </Button>
                  </HStack>
                )}
              </Box>
            ))}
          </Box>
        ))}
      </VStack>

      <MealSelector
        isOpen={isOpen}
        onClose={onClose}
        onMealSelected={handleMealSelected}
        currentMainId={currentMainId || undefined}
        currentSideId={currentSideId || undefined}
      />
    </>
  );
} 