import React, { useState, useCallback } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from '@mui/material';
import {
  FileDownload,
  Google,
  TableChart,
  KeyboardArrowDown
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { GoogleSheetsExportService } from '../services/GoogleSheetsExportService';
import type { Student } from '../types';

interface ExportButtonProps {
  filteredStudents: Student[];
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ filteredStudents, disabled = false }) => {
  const { state } = useAuth();
  const user = state.user;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [exportedSheetUrl, setExportedSheetUrl] = useState('');
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('Filtered Students Export');

  const open = Boolean(anchorEl);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleGoogleSheetsExport = useCallback(async () => {
    if (!user?.accessToken) {
      setErrorMessage('Please sign in to export to Google Sheets');
      setShowError(true);
      return;
    }

    if (filteredStudents.length === 0) {
      setErrorMessage('No students to export. Please adjust your filters.');
      setShowError(true);
      return;
    }

    setIsExporting(true);
    handleClose();

    try {
      const result = await GoogleSheetsExportService.exportFilteredStudents(
        filteredStudents,
        user.accessToken,
        sheetTitle
      );

      if (result.success && result.sheetUrl) {
        setExportedSheetUrl(result.sheetUrl);
        setShowSuccess(true);
        
        // Optional: Open the exported sheet in a new tab
        window.open(result.sheetUrl, '_blank');
      } else {
        setErrorMessage(result.error || 'Failed to export to Google Sheets');
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      setShowError(true);
    } finally {
      setIsExporting(false);
    }
  }, [user, filteredStudents, sheetTitle, handleClose]);

  const handleCSVExport = useCallback(() => {
    if (filteredStudents.length === 0) {
      setErrorMessage('No students to export. Please adjust your filters.');
      setShowError(true);
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `filtered_students_${timestamp}.csv`;
    
    GoogleSheetsExportService.exportAsCSV(filteredStudents, filename);
    
    setShowSuccess(true);
    handleClose();
  }, [filteredStudents, handleClose]);

  const handleTitleDialogOpen = useCallback(() => {
    setShowTitleDialog(true);
    handleClose();
  }, [handleClose]);

  const handleTitleDialogClose = useCallback(() => {
    setShowTitleDialog(false);
  }, []);

  const handleTitleDialogConfirm = useCallback(() => {
    setShowTitleDialog(false);
    handleGoogleSheetsExport();
  }, [handleGoogleSheetsExport]);

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
        endIcon={!isExporting && <KeyboardArrowDown />}
        onClick={handleClick}
        disabled={disabled || isExporting || exportCount === 0}
        sx={{ minWidth: 140 }}
      >
        {isExporting ? 'Exporting...' : `Export (${exportCount})`}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleTitleDialogOpen} disabled={!user}>
          <ListItemIcon>
            <Google />
          </ListItemIcon>
          <ListItemText>
            Export to Google Sheets
            {!user && (
              <span style={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                (Sign in required)
              </span>
            )}
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleCSVExport}>
          <ListItemIcon>
            <TableChart />
          </ListItemIcon>
          <ListItemText>Download as CSV</ListItemText>
        </MenuItem>
      </Menu>

      {/* Title Dialog for Google Sheets Export */}
      <Dialog
        open={showTitleDialog}
        onClose={handleTitleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export to Google Sheets</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a title for your exported Google Sheet. The current date will be automatically appended.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Sheet Title"
            type="text"
            fullWidth
            variant="outlined"
            value={sheetTitle}
            onChange={(e) => setSheetTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTitleDialogClose}>Cancel</Button>
          <Button onClick={handleTitleDialogConfirm} variant="contained">
            Create Sheet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {exportedSheetUrl ? (
            <>
              Export successful! 
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => window.open(exportedSheetUrl, '_blank')}
                sx={{ ml: 1 }}
              >
                Open Sheet
              </Button>
            </>
          ) : (
            'Export completed successfully!'
          )}
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
