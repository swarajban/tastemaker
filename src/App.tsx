import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { AppRouter } from './router';

function App() {
  return (
    <ChakraProvider>
      <AppRouter />
    </ChakraProvider>
  );
}

export default App;
