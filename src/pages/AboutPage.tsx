import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function AboutPage() {
  return (
    <Box p={8}>
      <Heading mb={4}>About Tastemaker</Heading>
      <Text fontSize="lg">
        Tastemaker is a modern meal planning application that helps both newbies 
        and experienced home chefs plan weekly or daily meals. 
        By integrating with Supabase and leveraging your stored preferences, 
        Tastemaker makes it easy to discover new meals, manage your own recipes, 
        and automatically generate weekly schedules.
      </Text>
      <Text mt={4}>
        Whether you’re looking to organize balanced meals, reduce food waste, 
        or explore new cooking ideas, Tastemaker has features to help streamline your process.
      </Text>
    </Box>
  );
} 