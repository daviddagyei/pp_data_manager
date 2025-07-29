import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
} from '@mui/material';
import {
  ViewColumn,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import DataDisplaySettings from './SimpleDataDisplaySettings';

const SettingsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <ViewColumn sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Data Display Settings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Customize how student data is displayed in tables and manage columns
                </Typography>
              </Box>
            </Box>

            <DataDisplaySettings />
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default SettingsPage;