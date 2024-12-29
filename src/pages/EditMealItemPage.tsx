// src/pages/EditMealItemPage.tsx
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
  HStack,
  Text,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserMealItemsWithTags, updateMealItem, MealItemWithTags } from '../lib/api/mealItems';
import { Tag, getUserTags, createTag } from '../lib/api/tags';
import { supabase } from '../lib/supabaseClient';

export default function EditMealItemPage() {
  const { mealItemId } = useParams();
  const navigate = useNavigate();

  const [mealItem, setMealItem] = useState<MealItemWithTags | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [mealType, setMealType] = useState<'main' | 'side'>('main');
  const [effort, setEffort] = useState(1);

  // For creating new tags
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!mealItemId) return;

      const sessionResult = await supabase.auth.getSession();
      const userId = sessionResult.data?.session?.user?.id;
      if (!userId) return;

      // 1) Load all user meal items with tags
      const allItems = await getUserMealItemsWithTags(userId);
      const item = allItems.find((i) => i.id === mealItemId);
      if (!item) {
        console.error('Meal item not found');
        return;
      }
      setMealItem(item);

      // Pre-fill the form
      setTitle(item.title);
      setNotes(item.notes || '');
      setMealType(item.type);
      setEffort(item.effort);

      // 2) Load all user tags
      const userTags = await getUserTags(userId);
      setTags(userTags);

      // 3) Mark selectedTagIds for this item’s tags
      //    item.tags is an array of strings (tag names),
      //    but we need the tag IDs. So let's map the name->id from userTags.
      //    Alternatively, your mealItemsWithTags might store IDs instead, 
      //    but let's assume we only have name in `tags`.
      const selectedIds: string[] = [];
      item.tags.forEach((tagName) => {
        const foundTag = userTags.find(
          (t) => t.name.toLowerCase() === tagName.toLowerCase()
        );
        if (foundTag) {
          selectedIds.push(foundTag.id);
        }
      });
      setSelectedTagIds(selectedIds);
    }
    loadData();
  }, [mealItemId]);

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const existingTag = tags.find(
      (t) => t.name.toLowerCase() === newTagName.trim().toLowerCase()
    );
    let tagId = existingTag?.id;

    if (!existingTag) {
      const sessionResult = await supabase.auth.getSession();
      const userId = sessionResult.data?.session?.user?.id;
      if (!userId) return;

      const newTag = await createTag(userId, newTagName.trim());
      setTags((prev) => [...prev, newTag]);
      tagId = newTag.id;
    }

    // Check in selectedTagIds
    if (tagId && !selectedTagIds.includes(tagId)) {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
    setNewTagName('');
  };

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
    navigate('/meal-items');
  };

  if (!mealItem) {
    return (
      <Box p={4}>
        <Heading>Loading or not found...</Heading>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading>Edit Meal Item</Heading>

      {/* Title */}
      <FormControl mt={4}>
        <FormLabel>Title</FormLabel>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormControl>

      {/* Notes */}
      <FormControl mt={4}>
        <FormLabel>Notes</FormLabel>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </FormControl>

      {/* Type */}
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

      {/* Effort */}
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

      {/* Existing Tags (checkboxes) */}
      <FormControl mt={4}>
        <FormLabel>Existing Tags</FormLabel>
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
                  setSelectedTagIds(
                    selectedTagIds.filter((id) => id !== tag.id)
                  );
                }
              }}
            >
              {tag.name}
            </Checkbox>
          ))}
        </VStack>
      </FormControl>

      {/* Add New Tag */}
      <FormControl mt={4}>
        <FormLabel>Add a new tag</FormLabel>
        <HStack>
          <Input
            placeholder="Tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <Button onClick={handleAddTag} colorScheme="teal">
            Add Tag
          </Button>
        </HStack>
      </FormControl>

      {/* Save */}
      <Button mt={4} colorScheme="teal" onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
}
