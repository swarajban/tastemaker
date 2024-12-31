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
  const [isNewUser, setIsNewUser] = useState(false);

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
      <Heading mb={4}>{isNewUser ? 'Sign Up' : 'Login'}</Heading>
      
      {emailSent ? (
        <Alert status="success" mb={4}>
          <AlertIcon />
          Check your email for the {isNewUser ? 'signup' : 'login'} link!
        </Alert>
      ) : (
        <>
          <Text mb={4}>
            {isNewUser 
              ? 'Enter your email to create an account'
              : 'Enter your email to login to your account'}
          </Text>
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
              {isNewUser ? 'Sign Up' : 'Login'}
            </Button>

            <Button
              variant="link"
              width="100%"
              mt={4}
              onClick={() => setIsNewUser(!isNewUser)}
            >
              {isNewUser 
                ? 'Already have an account? Login'
                : "Don't have an account? Sign Up"}
            </Button>
          </form>
        </>
      )}
    </Box>
  );
}
