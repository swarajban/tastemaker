import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function AboutPage() {
  return (
    <Box p={8}>
      <Heading mb={4}>About Tastemaker</Heading>
      <Text fontSize="lg">
        Tastemaker is an app to help plan which meals to cook for the week. Simply add your
        meal items and the app will generate a schedule for you. You can specify tags
        for each meal and generate schedules that can prevent multiple meals with same
        tag from being scheduled on the same day, e.g. don't have potatoes twice in a day.
      </Text>

      <Heading size="lg" mt={8} mb={4}>Stack</Heading>
      <Text>
        Tastemaker is built with React, TypeScript, Chakra UI, and Supabase. We use
        Supabase for both authentication and database. The app is hosted on Netlify. and
        has no custom backend. 100% of the code was written by Cursor/Sonnet/OpenAI
        generations; I didn't write a single line of code myself.
      </Text>
    </Box>
  );
} 