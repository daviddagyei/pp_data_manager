import React from 'react';
import {Typography, Container, Paper } from '@mui/material';
import SignInSheetSection from './SignInSheetSection';

const SecurityDashboard: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Security Dashboard
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Token & Access Security
        </Typography>
        {/* Add your token security panel or other security widgets here */}
      </Paper>
      <SignInSheetSection />
    </Container>
  );
};

export default SecurityDashboard;
