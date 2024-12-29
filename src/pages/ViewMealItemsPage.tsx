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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getUserMealItemsWithTags, MealItemWithTags } from '../lib/api/mealItems';

export default function ViewMealItemsPage() {
  const navigate = useNavigate();
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

  return (
    <Box p={4}>
      <Heading mb={4}>Your Meal Items</Heading>
      <Button onClick={handleAddMealItem} colorScheme="teal" mb={4}>
        Add New Item
      </Button>

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
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleEditMealItem(item.id)}
                  >
                    Edit
                  </Button>
                </HStack>
              </Box>
            ))
          )}
        </VStack>
      )}
    </Box>
  );
}
