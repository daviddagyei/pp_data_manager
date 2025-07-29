import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Divider,
} from '@mui/material';
import {
  ViewColumn,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import DataDisplaySettings from './SimpleDataDisplaySettings';
import { ColumnManagementDialog } from '../ColumnManagementDialog';

const SettingsPage: React.FC = () => {
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);

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

            {/* Custom Column Management Section */}
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Custom Columns
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add custom fields to collect additional student information
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setColumnDialogOpen(true)}
                  sx={{ minWidth: 140 }}
                >
                  Manage Columns
                </Button>
              </Box>
            </Paper>

            <Divider sx={{ my: 3 }} />

            <DataDisplaySettings />
          </Box>
        </Paper>
      </motion.div>

      <ColumnManagementDialog
        open={columnDialogOpen}
        onClose={() => setColumnDialogOpen(false)}
      />
    </Container>
  );
};

export default SettingsPage;