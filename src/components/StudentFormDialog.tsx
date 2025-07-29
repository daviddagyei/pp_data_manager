import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  FormControlLabel,
  Checkbox,
  Alert,
  Typography,
  Divider,
  CircularProgress
} from '@mui/material';
import type { Student } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { validateCustomFieldValue } from '../utils/customFieldValidation';

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
  const { state: settingsState } = useSettings();
  
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
    customFields: {} as Record<string, any>,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
        customFields: initialData.customFields || {},
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
        customFields: {},
      });
    }
    setError(null);
    setFieldErrors({});
  }, [initialData, open]);

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    // Clear field-specific error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldName]: value
      }
    }));
    setError(null);
    // Clear field-specific error when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate standard fields
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    }
    if (!formData.highSchool.trim()) {
      errors.highSchool = 'High school is required';
    }
    if (!formData.dob) {
      errors.dob = 'Date of birth is required';
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Validate graduation year
    const currentYear = new Date().getFullYear();
    if (formData.graduationYear < currentYear || formData.graduationYear > currentYear + 10) {
      errors.graduationYear = 'Please enter a valid graduation year';
    }

    // Validate custom fields
    const customColumns = settingsState.settings.dataDisplay.columnSettings.filter(col => col.isCustom);
    for (const column of customColumns) {
      const value = formData.customFields[column.field];
      const validation = validateCustomFieldValue(value, column);
      
      if (!validation.isValid) {
        errors[column.field] = validation.error!;
      }
    }

    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setError('Please fix the highlighted errors');
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

  // Helper function to render custom field inputs
  const renderCustomField = (column: any) => {
    const value = formData.customFields[column.field] || '';
    const hasError = !!fieldErrors[column.field];
    const errorMessage = fieldErrors[column.field];

    switch (column.type) {
      case 'boolean':
        return (
          <FormControl key={column.id} fullWidth>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!value}
                  onChange={(e) => handleCustomFieldChange(column.field, e.target.checked)}
                />
              }
              label={column.headerName}
            />
            {hasError && (
              <Typography variant="caption" color="error" sx={{ ml: 4 }}>
                {errorMessage}
              </Typography>
            )}
          </FormControl>
        );

      case 'number':
        return (
          <TextField
            key={column.id}
            fullWidth
            label={column.headerName}
            type="number"
            value={value}
            onChange={(e) => handleCustomFieldChange(column.field, parseFloat(e.target.value) || '')}
            error={hasError}
            helperText={errorMessage || column.description}
            required={column.required}
          />
        );

      case 'date':
        return (
          <TextField
            key={column.id}
            fullWidth
            label={column.headerName}
            type="date"
            value={value ? (typeof value === 'string' ? value.split('T')[0] : value) : ''}
            onChange={(e) => handleCustomFieldChange(column.field, e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={hasError}
            helperText={errorMessage || column.description}
            required={column.required}
          />
        );

      case 'email':
        return (
          <TextField
            key={column.id}
            fullWidth
            label={column.headerName}
            type="email"
            value={value}
            onChange={(e) => handleCustomFieldChange(column.field, e.target.value)}
            error={hasError}
            helperText={errorMessage || column.description}
            required={column.required}
          />
        );

      case 'phone':
        return (
          <TextField
            key={column.id}
            fullWidth
            label={column.headerName}
            type="tel"
            value={value}
            onChange={(e) => handleCustomFieldChange(column.field, e.target.value)}
            error={hasError}
            helperText={errorMessage || column.description}
            required={column.required}
          />
        );

      default: // string
        return (
          <TextField
            key={column.id}
            fullWidth
            label={column.headerName}
            value={value}
            onChange={(e) => handleCustomFieldChange(column.field, e.target.value)}
            error={hasError}
            helperText={errorMessage || column.description}
            required={column.required}
            inputProps={{
              maxLength: column.maxLength
            }}
          />
        );
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
              error={!!fieldErrors.firstName}
              helperText={fieldErrors.firstName}
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
              disabled={loading}
              fullWidth
              error={!!fieldErrors.lastName}
              helperText={fieldErrors.lastName}
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
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Cell Number"
              value={formData.cellNumber}
              onChange={(e) => handleChange('cellNumber', e.target.value)}
              disabled={loading}
              fullWidth
              error={!!fieldErrors.cellNumber}
              helperText={fieldErrors.cellNumber}
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
              error={!!fieldErrors.dob}
              helperText={fieldErrors.dob}
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
              error={!!fieldErrors.highSchool}
              helperText={fieldErrors.highSchool}
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
              error={!!fieldErrors.graduationYear}
              helperText={fieldErrors.graduationYear}
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
              error={!!fieldErrors.parentName}
              helperText={fieldErrors.parentName}
            />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Parent/Guardian Cell"
                value={formData.parentCell}
                onChange={(e) => handleChange('parentCell', e.target.value)}
                disabled={loading}
                fullWidth
                error={!!fieldErrors.parentCell}
                helperText={fieldErrors.parentCell}
              />
              <TextField
                label="Parent/Guardian Email"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => handleChange('parentEmail', e.target.value)}
                disabled={loading}
                fullWidth
                error={!!fieldErrors.parentEmail}
                helperText={fieldErrors.parentEmail}
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

          {/* Custom Fields Section */}
          {settingsState.settings.dataDisplay.columnSettings.filter(col => col.isCustom && col.editable).length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Additional Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Custom fields configured for your organization
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {settingsState.settings.dataDisplay.columnSettings
                  .filter(col => col.isCustom && col.editable)
                  .map(column => renderCustomField(column))
                }
              </Box>
            </>
          )}
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
