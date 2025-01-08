// src/pages/ViewMealItemsPage.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Button,
  Spinner,
  Text,
  VStack,
  HStack,
  Badge,
  useToast,
  Tooltip,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getUserMealItemsWithTags, MealItemWithTags, deleteMealItem, createMealItem } from '../lib/api/mealItems';
import { parseMealItemsCsv } from '../lib/util/csvParser';
import { Tag, getUserTags, createTag } from '../lib/api/tags';

export default function ViewMealItemsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState<MealItemWithTags[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      try {
        const sessionResult = await supabase.auth.getSession();
        const userId = sessionResult.data?.session?.user?.id;
        if (!userId) {
          // not logged in
          setLoading(false);
          return;
        }
        const mealItems = await getUserMealItemsWithTags(userId);
        setItems(mealItems);
      } catch (err) {
        console.error('Error loading meal items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  const handleAddMealItem = () => {
    navigate('/add-meal-item');
  };

  const handleEditMealItem = (itemId: string) => {
    navigate(`/edit-meal-item/${itemId}`);
  };

  const handleRemoveMealItem = async (itemId: string) => {
    try {
      await deleteMealItem(itemId);
      setItems(items.filter(item => item.id !== itemId));
    } catch (err: any) {
      console.error('Error removing meal item:', err);
      
      // Check for the specific database constraint error
      if (err?.code === '23502') {
        toast({
          title: 'Cannot Delete Item',
          description: 'This meal item is currently being used in a schedule. Please remove it from all schedules first.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to remove meal item. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  async function handleCsvImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const mealItems = parseMealItemsCsv(text);
      
      const sessionResult = await supabase.auth.getSession();
      const userId = sessionResult.data?.session?.user?.id;
      if (!userId) return;

      // Get existing tags once at the start
      let existingTags = await getUserTags(userId);
      
      for (const item of mealItems) {
        const tagIds: string[] = [];
        for (const tagName of item.tags) {
          // Case-insensitive search for existing tag
          let tag = existingTags.find(t => 
            t.name.toLowerCase() === tagName.toLowerCase()
          );

          // Create new tag if it doesn't exist
          if (!tag) {
            try {
              const newTag = await createTag(userId, tagName);
              tag = newTag;
              // Add to existing tags to prevent duplicate creation attempts
              existingTags.push(newTag);
            } catch (tagError: any) {
              // If tag creation failed due to duplicate, fetch the existing tag
              if (tagError?.code === '23505') {
                existingTags = await getUserTags(userId); // Refresh tags list
                tag = existingTags.find(t => 
                  t.name.toLowerCase() === tagName.toLowerCase()
                );
              } else {
                throw tagError;
              }
            }
          }
          
          if (tag) {
            tagIds.push(tag.id);
          }
        }

        // Create the meal item with tags
        await createMealItem(
          userId,
          {
            title: item.name,
            notes: item.notes,
            type: item.type,
            effort: item.effort,
          },
          tagIds
        );
      }

      // Refresh the list
      const updatedItems = await getUserMealItemsWithTags(userId);
      setItems(updatedItems);

      toast({
        title: 'Import Successful',
        description: `Imported ${mealItems.length} meal items`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    // Clear the file input
    event.target.value = '';
  }

  return (
    <Box p={4}>
      <Heading mb={4}>Your Meal Items</Heading>
      <HStack spacing={4} mb={4}>
        <Button onClick={handleAddMealItem} colorScheme="teal">
          Add New Item
        </Button>
        <Tooltip label="CSV format: Name, Type (main/side), Notes, Effort (1-3), Tag1, Tag2, Tag3">
          <Button
            as="label"
            htmlFor="csv-upload"
            colorScheme="blue"
            cursor="pointer"
          >
            Import from CSV
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleCsvImport}
              style={{ display: 'none' }}
            />
          </Button>
        </Tooltip>
      </HStack>

      {loading ? (
        <Spinner />
      ) : (
        <VStack align="start" spacing={3}>
          {items.length === 0 ? (
            <Text>No meal items found.</Text>
          ) : (
            items.map((item) => (
              <Box
                key={item.id}
                p={3}
                borderWidth={1}
                borderRadius="md"
                width="100%"
              >
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="bold">{item.title}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {item.type.toUpperCase()} | Effort {item.effort}
                    </Text>
                    {item.tags.length > 0 && (
                      <HStack mt={1}>
                        {item.tags.map((tag) => (
                          <Badge key={tag} colorScheme="blue">
                            {tag}
                          </Badge>
                        ))}
                      </HStack>
                    )}
                  </Box>
                  <HStack>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleEditMealItem(item.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleRemoveMealItem(item.id)}
                    >
                      Remove
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            ))
          )}
        </VStack>
      )}
    </Box>
  );
}
