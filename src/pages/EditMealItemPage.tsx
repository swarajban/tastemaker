import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Checkbox,
  VStack,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserMealItems, updateMealItem, MealItem } from '../lib/api/mealItems';
import { Tag, getUserTags } from '../lib/api/tags';
import { supabase } from '../lib/supabaseClient';

export default function EditMealItemPage() {
  const { mealItemId } = useParams();
  const navigate = useNavigate();

  const [mealItem, setMealItem] = useState<MealItem | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [mealType, setMealType] = useState<'main' | 'side'>('main');
  const [effort, setEffort] = useState(1);

  useEffect(() => {
    async function loadData() {
      if (!mealItemId) return;
      const sessionResult = await supabase.auth.getSession();
      const userId = sessionResult.data?.session?.user?.id;
      if (!userId) return;

      // 1) Load the user’s meal items 
      const items = await getUserMealItems(userId);
      const item = items.find((i) => i.id === mealItemId);
      if (!item) return; // or handle error

      setMealItem(item);
      setTitle(item.title);
      setNotes(item.notes || '');
      setMealType(item.type);
      setEffort(item.effort);

      // 2) Load all user tags
      const userTags = await getUserTags(userId);
      setTags(userTags);

      // 3) We need the existing tags for this meal_item. 
      //    Either query from meal_item_tag or do an RPC that returns joined data.
      //    For a quick approach, you might fetch the meal_item_tag table directly:
      const { data: mealItemTags, error } = await supabase
        .from('meal_item_tag')
        .select('tag_id')
        .eq('meal_item_id', mealItemId);
      if (error) console.error(error);

      if (mealItemTags) {
        const existingTagIds = mealItemTags.map((row) => row.tag_id);
        setSelectedTagIds(existingTagIds);
      }
    }
    loadData();
  }, [mealItemId]);

  const handleSave = async () => {
    if (!mealItemId) return;
    await updateMealItem(
      mealItemId,
      {
        title,
        notes,
        type: mealType,
        effort,
      },
      selectedTagIds
    );
    navigate('/schedules'); // or back to list
  };

  if (!mealItem) {
    return (
      <Box p={4}>
        <Heading>Loading...</Heading>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading>Edit Meal Item</Heading>
      <FormControl mt={4}>
        <FormLabel>Title</FormLabel>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormControl>
      <FormControl mt={4}>
        <FormLabel>Notes</FormLabel>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </FormControl>
      <FormControl mt={4}>
        <FormLabel>Type</FormLabel>
        <Select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as 'main' | 'side')}
        >
          <option value="main">Main</option>
          <option value="side">Side</option>
        </Select>
      </FormControl>
      <FormControl mt={4}>
        <FormLabel>Effort (1-3)</FormLabel>
        <Select
          value={effort}
          onChange={(e) => setEffort(parseInt(e.target.value, 10))}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </Select>
      </FormControl>

      <FormControl mt={4}>
        <FormLabel>Tags</FormLabel>
        <VStack align="start">
          {tags.map((tag) => (
            <Checkbox
              key={tag.id}
              value={tag.id}
              isChecked={selectedTagIds.includes(tag.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedTagIds([...selectedTagIds, tag.id]);
                } else {
                  setSelectedTagIds(selectedTagIds.filter((id) => id !== tag.id));
                }
              }}
            >
              {tag.name}
            </Checkbox>
          ))}
        </VStack>
      </FormControl>
      <Button mt={4} colorScheme="teal" onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
}
