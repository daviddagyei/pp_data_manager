import React from 'react';
import SignInSheetTable from './SignInSheetTable';
import { Box } from '@mui/material';
import { SignInSheetProvider } from '../contexts/SignInSheetContext';
import DashboardCard from './DashboardCard';

const SignInSheetSection: React.FC = () => {
  return (
    <SignInSheetProvider>
      <Box sx={{ mt: 4 }}>
        <DashboardCard title="Event Sign-In Data" subtitle="Search, filter, and manage event sign-in records">
          <SignInSheetTable />
        </DashboardCard>
      </Box>
    </SignInSheetProvider>
  );
};

export default SignInSheetSection;
