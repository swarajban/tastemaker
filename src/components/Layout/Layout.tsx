// src/components/Layout/Layout.tsx

import React, { useEffect, useState } from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Link,
  Button,
  useColorMode,
  useColorModeValue,
  Spacer,
  Heading,
} from '@chakra-ui/react';
import { supabase } from '../../lib/supabaseClient';
import { signOut } from '../../lib/api/auth';

export default function Layout() {
  const { colorMode, toggleColorMode } = useColorMode();
  const navBg = useColorModeValue('gray.100', 'gray.900');
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);

  // Fetch session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Subscribe to auth changes (optional)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Flex direction="column" minH="100vh">
      <Box bg={navBg} px={4} py={2} borderBottomWidth={1}>
        <Flex align="center">
          <Heading size="md" mr={4}>
            Tastemaker
          </Heading>

          {/* If user is logged in, show meal & schedule links */}
          {session && (
            <>
              <Link as={RouterLink} to="/meal-items" mr={4}>
                Meal Items
              </Link>
              <Link as={RouterLink} to="/schedules" mr={4}>
                Schedules
              </Link>
            </>
          )}

          <Spacer />

          {/* Toggle dark mode */}
          <Button size="sm" onClick={toggleColorMode} mr={2}>
            {colorMode === 'light' ? 'Dark' : 'Light'}
          </Button>

          {/* If session is active, show Logout; otherwise, show Login */}
          {session ? (
            <Button size="sm" colorScheme="red" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button size="sm" colorScheme="teal" onClick={handleLogin}>
              Login
            </Button>
          )}
        </Flex>
      </Box>

      <Box flex="1">
        <Outlet />
      </Box>

      <Box as="footer" bg={navBg} p={4} borderTopWidth={1} textAlign="center">
        © 2024 Tastemaker
      </Box>
    </Flex>
  );
}
