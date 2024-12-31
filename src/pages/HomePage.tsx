import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Text, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/schedules');
      }
      setLoading(false);
    }
    checkSession();
  }, [navigate]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <Box p={8} display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

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
