import React from 'react';
import SignInSheetTable from './SignInSheetTable';
import { Box, Typography } from '@mui/material';
import { SignInSheetProvider } from '../contexts/SignInSheetContext';

const SignInSheetSection: React.FC = () => {
  return (
    <SignInSheetProvider>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Event Sign-In Data
        </Typography>
        <SignInSheetTable />
      </Box>
    </SignInSheetProvider>
  );
};

export default SignInSheetSection;
