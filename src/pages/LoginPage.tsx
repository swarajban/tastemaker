// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail } from '../lib/api/auth'; 
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Attempt login
      await signInWithEmail(email, password);

      // If successful, supabase automatically sets the auth session.
      // We can check or simply navigate to /schedules.
      navigate('/schedules');
    } catch (error: any) {
      // handle error from supabase
      setErrorMsg(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Box p={8} maxWidth="400px" margin="0 auto">
      <Heading mb={4}>Login</Heading>
      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormControl>
        {errorMsg && (
          <Text color="red.500" mb={2}>
            {errorMsg}
          </Text>
        )}
        <Button type="submit" colorScheme="teal">
          Log In
        </Button>
      </form>
    </Box>
  );
}
