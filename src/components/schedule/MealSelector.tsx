import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Select,
  Button,
  VStack,
  Text,
} from '@chakra-ui/react';
import { supabase } from '../../lib/supabaseClient';
import { getUserMealItemsWithTags, MealItemWithTags } from '../../lib/api/mealItems';

interface MealSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onMealSelected: (mainItemId: string, sideItemId: string) => Promise<void>;
  currentMainId?: string;
  currentSideId?: string;
}

export default function MealSelector({ 
  isOpen, 
  onClose, 
  onMealSelected, 
  currentMainId,
  currentSideId 
}: MealSelectorProps) {
  const [mainItems, setMainItems] = useState<MealItemWithTags[]>([]);
  const [sideItems, setSideItems] = useState<MealItemWithTags[]>([]);
  const [selectedMainId, setSelectedMainId] = useState<string>('');
  const [selectedSideId, setSelectedSideId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadMealItems() {
      const sessionResult = await supabase.auth.getSession();
      const userId = sessionResult.data?.session?.user?.id;
      if (!userId) return;

      const items = await getUserMealItemsWithTags(userId);
      setMainItems(items.filter(i => i.type === 'main'));
      setSideItems(items.filter(i => i.type === 'side'));
    }
    if (isOpen) {
      loadMealItems();
      // Set initial values when modal opens
      setSelectedMainId(currentMainId || '');
      setSelectedSideId(currentSideId || '');
    }
  }, [isOpen, currentMainId, currentSideId]);

  const handleSave = async () => {
    if (selectedMainId && selectedSideId) {
      setIsSaving(true);
      try {
        await onMealSelected(selectedMainId, selectedSideId);
        onClose();
      } catch (error) {
        console.error('Error saving meal:', error);
        // You might want to show an error toast here
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select New Meal</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} pb={4}>
            <Text fontWeight="bold">Main Item</Text>
            <Select
              value={selectedMainId}
              onChange={(e) => setSelectedMainId(e.target.value)}
              placeholder="Select main item"
            >
              {mainItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </Select>

            <Text fontWeight="bold">Side Item</Text>
            <Select
              value={selectedSideId}
              onChange={(e) => setSelectedSideId(e.target.value)}
              placeholder="Select side item"
            >
              {sideItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </Select>

            <Button
              colorScheme="blue"
              onClick={handleSave}
              isLoading={isSaving}
              isDisabled={!selectedMainId || !selectedSideId}
            >
              Save Changes
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 