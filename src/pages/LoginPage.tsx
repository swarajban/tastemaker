// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { signInWithMagicLink } from '../lib/api/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      await signInWithMagicLink(email);
      setEmailSent(true);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to send login link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={8} maxWidth="400px" margin="0 auto">
      <Heading mb={4}>Login</Heading>
      
      {emailSent ? (
        <Alert status="success" mb={4}>
          <AlertIcon />
          Check your email for the login link!
        </Alert>
      ) : (
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

          {errorMsg && (
            <Text color="red.500" mb={2}>
              {errorMsg}
            </Text>
          )}

          <Button 
            type="submit" 
            colorScheme="teal" 
            width="100%"
            isLoading={isSubmitting}
            loadingText="Sending..."
          >
            Send Login Link
          </Button>
        </form>
      )}
    </Box>
  );
}
