import React from 'react';
import { Box, Heading, Text, Link } from '@chakra-ui/react';

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

      <Heading size="lg" mt={8} mb={4}>Instructions</Heading>
      <Text>
        After creating an account, add meal items via the "Meal Items" page. A meal item
        represents a single dish for a meal. There are two types of meal items: Main or Side.
        When generating a meal schedule, we will pick one main and one side for each meal, e.g. 
        lunch on a given day could be a sandwich (main) and a salad (side). 
        <br />
        <br />
        You can optionally add tags to a meal item. Tags can be used both for organization and to prevent
        scheduling multiple meals with the same tag on the same day. For example, you might tag a sandwich
        as a "bread" tag. If you have multiple meal items that are tagged as "bread", when generating a 
        schedule, you can select which tags to not schedule on the same day.
        <br />
        <br />
        Once you have added meal items, you can generate a schedule by clicking the "Create New Schedule" button.
        on the "Schedules" page. On this page, you can select the date range and preview the randomly generated schedule.
        You can manually edit / remove / add meals on any given day if you don't like the selection. You can edit 
        generated schedules on the "Schedules" page as well.
      </Text>

      <Heading size="lg" mt={8} mb={4}>Roadmap</Heading>
      <Text>
        For feature ideas, please use our <Link color="blue.500" href="https://github.com/swarajban/tastemaker/issues" isExternal>GitHub issues</Link> page.
        <br />
        <br />
        We are tracking progress on ideas on our <Link color="blue.500" href="https://github.com/users/swarajban/projects/2" isExternal>GitHub project board</Link>.
      </Text>

      <Heading size="lg" mt={8} mb={4}>Stack</Heading>
      <Text>
        Tastemaker is built with React, TypeScript, Chakra UI, and Supabase. We use
        Supabase for both authentication and database. The app is hosted on Netlify. and
        has no custom backend. 100% of the code was written by Cursor/Sonnet/OpenAI
        generations; I didn't write a single line of code <Link color="blue.500" href="https://github.com/swarajban/" isExternal>myself</Link>.
      </Text>
    </Box>
  );
} 