import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Close,
  Person,
  School,
  Phone,
  Email,
  CalendarToday,
  Event,
} from '@mui/icons-material';
import type { SignInRow } from '../types/signIn';

interface SignInDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  signIn: SignInRow | null;
}

const SignInDetailsDialog: React.FC<SignInDetailsDialogProps> = ({
  open,
  onClose,
  signIn,
}) => {
  if (!signIn) return null;

  const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return 'Not provided';
    // Basic phone formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person color="primary" />
          <Typography variant="h5" component="h2" fontWeight={600}>
            {signIn.firstName} {signIn.lastName}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Personal Information */}
          <Box>
            <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  First Name
                </Typography>
                <Typography variant="body1">
                  {signIn.firstName || 'Not provided'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Name
                </Typography>
                <Typography variant="body1">
                  {signIn.lastName || 'Not provided'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Graduation Year
                </Typography>
                <Typography variant="body1">
                  {signIn.gradYear || 'Not provided'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School fontSize="small" color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    School
                  </Typography>
                  <Typography variant="body1">
                    {signIn.school || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Contact Information */}
          <Box>
            <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {signIn.email || 'Not provided'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {formatPhoneNumber(signIn.phone)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Sign-In Information */}
          <Box>
            <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
              Sign-In Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday fontSize="small" color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sign-In Date
                  </Typography>
                  <Typography variant="body1">
                    {signIn.date || 'Not provided'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Event fontSize="small" color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Event
                  </Typography>
                  <Typography variant="body1">
                    {signIn.event || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignInDetailsDialog;
