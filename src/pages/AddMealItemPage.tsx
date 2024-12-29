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
import { useNavigate } from 'react-router-dom';
import { createMealItem } from '../lib/api/mealItems';
import { Tag, getUserTags } from '../lib/api/tags';
import { supabase } from '../lib/supabaseClient';

export default function AddMealItemPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [mealType, setMealType] = useState<'main' | 'side'>('main');
  const [effort, setEffort] = useState(1);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadTags() {
      const sessionResult = await supabase.auth.getSession();
      const userId = sessionResult.data?.session?.user?.id;
      if (!userId) return;
      const userTags = await getUserTags(userId);
      setTags(userTags);
    }
    loadTags();
  }, []);

  const handleSave = async () => {
    const sessionResult = await supabase.auth.getSession();
    const userId = sessionResult.data?.session?.user?.id;
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
    navigate('/schedules'); // or wherever you want to redirect
  };

  return (
    <Box p={4}>
      <Heading>Add Meal Item</Heading>
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
