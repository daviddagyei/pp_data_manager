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
import type { SignInRow } from '../types/signIn';

interface SignInExportButtonProps {
  filteredSignIns: SignInRow[];
  disabled?: boolean;
}

const SignInExportButton: React.FC<SignInExportButtonProps> = ({ filteredSignIns, disabled = false }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCSVExport = useCallback(() => {
    if (filteredSignIns.length === 0) {
      setErrorMessage('No sign-ins to export. Please adjust your filters.');
      setShowError(true);
      return;
    }

    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `sign_in_sheet_${timestamp}.csv`;
      
      // Prepare CSV data
      const headers = ['First Name', 'Last Name', 'School', 'Phone', 'Graduation Year', 'Email', 'Date', 'Event'];
      const csvContent = [
        headers.join(','),
        ...filteredSignIns.map(signIn => [
          `"${signIn.firstName}"`,
          `"${signIn.lastName}"`,
          `"${signIn.school}"`,
          `"${signIn.phone}"`,
          `"${signIn.gradYear}"`,
          `"${signIn.email}"`,
          `"${signIn.date}"`,
          `"${signIn.event}"`
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
  }, [filteredSignIns]);

  const handleSnackbarClose = useCallback(() => {
    setShowSuccess(false);
    setShowError(false);
  }, []);

  const exportCount = filteredSignIns.length;

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

export default React.memo(SignInExportButton);
