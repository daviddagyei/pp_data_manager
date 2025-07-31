import React, { useState, useCallback } from 'react';
import {
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  FileDownload,
} from '@mui/icons-material';
import type { Student } from '../types';

interface ExportButtonProps {
  filteredStudents: Student[];
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ filteredStudents, disabled = false }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCSVExport = useCallback(() => {
    if (filteredStudents.length === 0) {
      setErrorMessage('No students to export. Please adjust your filters.');
      setShowError(true);
      return;
    }

    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `filtered_students_${timestamp}.csv`;
      
      // Prepare CSV data - include all student fields
      const headers = [
        'First Name', 'Last Name', 'Date of Birth', 'Graduation Year', 
        'Email', 'Cell Phone', 'Parent Name', 'Parent Email',
        'High School'
      ];
      
      const csvContent = [
        headers.join(','),
        ...filteredStudents.map(student => [
          `"${student.firstName || ''}"`,
          `"${student.lastName || ''}"`,
          `"${student.dob ? new Date(student.dob).toLocaleDateString() : ''}"`,
          `"${student.graduationYear || ''}"`,
          `"${student.email || ''}"`,
          `"${student.cellNumber || ''}"`,
          `"${student.parentName || ''}"`,
          `"${student.parentEmail || ''}"`,
          `"${student.highSchool || ''}"`
        ].join(','))
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowSuccess(true);
    } catch (error) {
      setErrorMessage('Failed to export CSV file');
      setShowError(true);
    } finally {
      setIsExporting(false);
    }
  }, [filteredStudents]);

  const handleSnackbarClose = useCallback(() => {
    setShowSuccess(false);
    setShowError(false);
  }, []);

  const exportCount = filteredStudents.length;

  return (
    <>
      <Button
        variant="contained"
        startIcon={isExporting ? <CircularProgress size={16} /> : <FileDownload />}
        onClick={handleCSVExport}
        disabled={disabled || isExporting || exportCount === 0}
        sx={{ minWidth: 140 }}
      >
        {isExporting ? 'Exporting...' : `Export CSV (${exportCount})`}
      </Button>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          CSV export completed successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(ExportButton);
