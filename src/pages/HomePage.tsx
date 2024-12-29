import React from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const navigate = useNavigate();
  // This returns a promise, so typically you'd handle with a useEffect/hook. 
  // For simplicity, we’ll just demonstrate logic:
  const sessionPromise = supabase.auth.getSession();

  const handleLoginClick = async () => {
    navigate('/login');
    // const sessionResult = await sessionPromise;
    // const session = sessionResult.data?.session;
    // // If user is already logged in, go straight to schedules
    // if (session) {
    //   navigate('/schedules');
    // } else {
    //   // For a real app, you'd show a dedicated login flow or page
    //   // or perhaps call signInWithEmail(...) etc.
    //   navigate('/schedules'); 
    // }
  };

  return (
    <Box p={8}>
      <Heading>Tastemaker</Heading>
      <Text mt={4}>Plan your meals with ease.</Text>
      <Button mt={4} onClick={handleLoginClick} colorScheme="teal">
        Login
      </Button>
    </Box>
  );
}
