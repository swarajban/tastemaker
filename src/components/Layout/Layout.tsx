// src/components/Layout/Layout.tsx

import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
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

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/'; // or navigate() to home
  };

  return (
    <Flex direction="column" minH="100vh">
      {/* Top Nav Bar */}
      <Box bg={navBg} px={4} py={2} borderBottomWidth={1}>
        <Flex align="center">
          {/* Logo or app name */}
          <Heading size="md" mr={4}>
            Tastemaker
          </Heading>

          {/* Nav links */}
          <Link as={RouterLink} to="/meal-items" mr={4}>
            Meal Items
          </Link>
          <Link as={RouterLink} to="/schedules" mr={4}>
            Schedules
          </Link>

          {/* Expand spacer so next items go to the right */}
          <Spacer />

          {/* Toggle dark mode */}
          <Button size="sm" onClick={toggleColorMode} mr={2}>
            {colorMode === 'light' ? 'Dark' : 'Light'}
          </Button>

          {/* Logout */}
          <Button size="sm" colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        </Flex>
      </Box>

      {/* The main content area (child routes) */}
      <Box flex="1">
        <Outlet />
      </Box>

      {/* Optionally a footer */}
      <Box as="footer" bg={navBg} p={4} borderTopWidth={1} textAlign="center">
        © 2024 Tastemaker
      </Box>
    </Flex>
  );
}
