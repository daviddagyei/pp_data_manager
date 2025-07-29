import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
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
  TrendingUp,
} from '@mui/icons-material';
import type { Student } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface StudentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

const StudentDetailsDialog: React.FC<StudentDetailsDialogProps> = ({
  open,
  onClose,
  student,
}) => {
  const { state: settingsState } = useSettings();

  if (!student) return null;

  const customColumns = settingsState.settings.dataDisplay.columnSettings.filter(col => col.isCustom && col.visible);

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return 'Not provided';
    // Basic phone formatting (you can enhance this)
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatCustomFieldValue = (value: any, type: string) => {
    if (value === undefined || value === null || value === '') return 'Not provided';
    
    switch (type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return formatDate(value);
      case 'number':
        return value.toString();
      case 'phone':
        return formatPhoneNumber(value);
      case 'email':
      case 'string':
      default:
        return value.toString();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
            {student.firstName} {student.lastName}
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
                  Full Name
                </Typography>
                <Typography variant="body1">
                  {student.firstName} {student.lastName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Date of Birth
                </Typography>
                <Typography variant="body1">
                  {formatDate(student.dob)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Graduation Year
                </Typography>
                <Typography variant="body1">
                  {student.graduationYear}
                </Typography>
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
                    {student.email || 'Not provided'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cell Phone
                  </Typography>
                  <Typography variant="body1">
                    {formatPhoneNumber(student.cellNumber)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Parent Contact Information */}
          <Box>
            <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
              Parent/Guardian Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Parent/Guardian Name
                </Typography>
                <Typography variant="body1">
                  {student.parentName || 'Not provided'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Parent Cell
                  </Typography>
                  <Typography variant="body1">
                    {formatPhoneNumber(student.parentCell)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Parent Email
                  </Typography>
                  <Typography variant="body1">
                    {student.parentEmail || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Academic Information */}
          <Box>
            <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
              Academic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School fontSize="small" color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    High School
                  </Typography>
                  <Typography variant="body1">
                    {student.highSchool || 'Not specified'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp fontSize="small" color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Participation Points
                  </Typography>
                  <Typography variant="body1">
                    {student.participationPoints || 0} points
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Program Status */}
          <Box>
            <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
              Program Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Parent Form
                </Typography>
                <Chip
                  label={student.parentForm ? 'Complete' : 'Pending'}
                  color={student.parentForm ? 'success' : 'default'}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Career Exploration
                </Typography>
                <Chip
                  label={student.careerExploration ? formatDate(student.careerExploration) : 'Not completed'}
                  color={student.careerExploration ? 'info' : 'default'}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  College Exploration
                </Typography>
                <Chip
                  label={student.collegeExploration ? formatDate(student.collegeExploration) : 'Not completed'}
                  color={student.collegeExploration ? 'info' : 'default'}
                  variant="outlined"
                  size="small"
                />
              </Box>

              {student.collegeEnrolled !== undefined && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    College Enrolled
                  </Typography>
                  <Chip
                    label={student.collegeEnrolled ? 'Yes' : 'No'}
                    color={student.collegeEnrolled ? 'success' : 'default'}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* Additional Information */}
          {(student.spreadsheetSubmitted || student.places !== undefined || student.lastModified || customColumns.length > 0) && (
            <Box>
              <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {/* Custom Fields */}
                {customColumns.map((column) => {
                  const value = student.customFields?.[column.field];
                  return (
                    <Box key={column.id}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {column.headerName}
                      </Typography>
                      <Typography variant="body1">
                        {formatCustomFieldValue(value, column.type)}
                      </Typography>
                      {column.description && (
                        <Typography variant="caption" color="text.secondary">
                          {column.description}
                        </Typography>
                      )}
                    </Box>
                  );
                })}

                {/* Existing fields */}
                {student.spreadsheetSubmitted && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Spreadsheet Submitted
                    </Typography>
                    <Typography variant="body1">
                      {student.spreadsheetSubmitted}
                    </Typography>
                  </Box>
                )}

                {student.places !== undefined && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Places
                    </Typography>
                    <Typography variant="body1">
                      {student.places}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Modified
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(student.lastModified)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentDetailsDialog;
