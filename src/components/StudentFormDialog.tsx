import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import type { Student } from '../types';

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (student: Omit<Student, 'id' | 'rowIndex' | 'lastModified'>) => Promise<void>;
  initialData?: Student | null;
  title: string;
}

export const StudentFormDialog: React.FC<StudentFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cellNumber: '',
    parentName: '',
    parentCell: '',
    parentEmail: '',
    highSchool: '',
    graduationYear: new Date().getFullYear() + 4,
    dob: '',
    parentForm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        cellNumber: initialData.cellNumber || '',
        parentName: initialData.parentName || '',
        parentCell: initialData.parentCell || '',
        parentEmail: initialData.parentEmail || '',
        highSchool: initialData.highSchool,
        graduationYear: initialData.graduationYear,
        dob: initialData.dob.toISOString().split('T')[0],
        parentForm: initialData.parentForm,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        cellNumber: '',
        parentName: '',
        parentCell: '',
        parentEmail: '',
        highSchool: '',
        graduationYear: new Date().getFullYear() + 4,
        dob: '',
        parentForm: false,
      });
    }
    setError(null);
  }, [initialData, open]);

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.highSchool.trim()) {
      setError('High school is required');
      return false;
    }
    if (!formData.dob) {
      setError('Date of birth is required');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate graduation year
    const currentYear = new Date().getFullYear();
    if (formData.graduationYear < currentYear || formData.graduationYear > currentYear + 10) {
      setError('Please enter a valid graduation year');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const studentData = {
        ...formData,
        dob: new Date(formData.dob),
      };
      await onSubmit(studentData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
              disabled={loading}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
              disabled={loading}
              fullWidth
            />
          </Box>

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            disabled={loading}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Cell Number"
              value={formData.cellNumber}
              onChange={(e) => handleChange('cellNumber', e.target.value)}
              disabled={loading}
              fullWidth
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              required
              disabled={loading}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="High School"
              value={formData.highSchool}
              onChange={(e) => handleChange('highSchool', e.target.value)}
              required
              disabled={loading}
              fullWidth
            />
            <TextField
              label="Graduation Year"
              type="number"
              value={formData.graduationYear}
              onChange={(e) => handleChange('graduationYear', parseInt(e.target.value) || new Date().getFullYear())}
              required
              disabled={loading}
              fullWidth
              inputProps={{
                min: new Date().getFullYear(),
                max: new Date().getFullYear() + 10
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Parent/Guardian Name"
              value={formData.parentName}
              onChange={(e) => handleChange('parentName', e.target.value)}
              disabled={loading}
              fullWidth
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Parent/Guardian Cell"
                value={formData.parentCell}
                onChange={(e) => handleChange('parentCell', e.target.value)}
                disabled={loading}
                fullWidth
              />
              <TextField
                label="Parent/Guardian Email"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => handleChange('parentEmail', e.target.value)}
                disabled={loading}
                fullWidth
              />
            </Box>
          </Box>

          <FormControl sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.parentForm}
                  onChange={(e) => handleChange('parentForm', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Parent form submitted"
            />
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : initialData ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
