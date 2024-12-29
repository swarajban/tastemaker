// src/pages/AddMealItemPage.tsx
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
import { useNavigate } from 'react-router-dom';
import { createMealItem } from '../lib/api/mealItems';
import { Tag, getUserTags, createTag } from '../lib/api/tags';
import { supabase } from '../lib/supabaseClient';

export default function AddMealItemPage() {
  const navigate = useNavigate();
  
  // Form fields
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [mealType, setMealType] = useState<'main' | 'side'>('main');
  const [effort, setEffort] = useState(1);

  // Tag-related state
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState(''); // for creating a new tag

  useEffect(() => {
    async function loadTags() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return;

      const userTags = await getUserTags(userId);
      setTags(userTags);
    }
    loadTags();
  }, []);

  // Handler to create a new tag in the DB if it doesn’t exist, then select it
  const handleAddTag = async () => {
    if (!newTagName.trim()) return; // ignore empty
    const existingTag = tags.find(
      (t) => t.name.toLowerCase() === newTagName.trim().toLowerCase()
    );
    let tagId = existingTag?.id;

    if (!existingTag) {
      // create new tag
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return;

      const newTag = await createTag(userId, newTagName.trim());
      setTags((prev) => [...prev, newTag]);
      tagId = newTag.id;
    }

    // If we have a valid tagId (existing or newly created), add it to selectedTagIds
    if (tagId && !selectedTagIds.includes(tagId)) {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }

    // Clear input
    setNewTagName('');
  };

  const handleSave = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return;

    await createMealItem(
      userId,
      {
        title,
        notes,
        type: mealType,
        effort,
      },
      selectedTagIds
    );
    navigate('/meal-items'); // or /schedules, etc.
  };

  return (
    <Box p={4}>
      <Heading>Add Meal Item</Heading>

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

      {/* Meal Type */}
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
        {newTagName.trim() === '' && <Text fontSize="sm" color="gray.500">Enter a tag name and click "Add Tag"</Text>}
      </FormControl>

      {/* Save Button */}
      <Button mt={4} colorScheme="teal" onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
}
