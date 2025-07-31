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
import type { SignInRow } from '../types/signIn';

interface SignInExportButtonProps {
  filteredSignIns: SignInRow[];
  disabled?: boolean;
}

const SignInExportButton: React.FC<SignInExportButtonProps> = ({ filteredSignIns, disabled = false }) => {
  const { state } = useAuth();
  const user = state.user;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [exportedSheetUrl, setExportedSheetUrl] = useState('');
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('Sign-In Sheet Export');

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

    if (filteredSignIns.length === 0) {
      setErrorMessage('No sign-ins to export. Please adjust your filters.');
      setShowError(true);
      return;
    }

    setIsExporting(true);
    handleClose();

    try {
      // Initialize Google Sheets API
      const initialized = await initializeExportAPI(user.accessToken);
      if (!initialized) {
        throw new Error('Failed to initialize Google Sheets API');
      }

      // Create spreadsheet
      const spreadsheetResponse = await window.gapi!.client.sheets.spreadsheets.create({
        properties: {
          title: `${sheetTitle} - ${new Date().toLocaleDateString()}`
        },
        sheets: [{
          properties: {
            title: 'Sign-In Data'
          }
        }]
      });

      const spreadsheetId = spreadsheetResponse.result.spreadsheetId;
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

      // Prepare data for export
      const headers = ['First Name', 'Last Name', 'School', 'Phone', 'Graduation Year', 'Email', 'Date', 'Event'];
      const data = [
        headers,
        ...filteredSignIns.map(signIn => [
          signIn.firstName,
          signIn.lastName,
          signIn.school,
          signIn.phone,
          signIn.gradYear,
          signIn.email,
          signIn.date,
          signIn.event
        ])
      ];

      // Update the sheet with data
      await window.gapi!.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sign-In Data!A1',
        valueInputOption: 'RAW',
        resource: {
          values: data
        }
      });

      // Format the header row
      await window.gapi!.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: headers.length
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                    textFormat: { bold: true }
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)'
              }
            },
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: 0,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: headers.length
                }
              }
            }
          ]
        }
      });

      setExportedSheetUrl(sheetUrl);
      setShowSuccess(true);
      
      // Optional: Open the exported sheet in a new tab
      window.open(sheetUrl, '_blank');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to export to Google Sheets');
      setShowError(true);
    } finally {
      setIsExporting(false);
    }
  }, [user, filteredSignIns, sheetTitle, handleClose]);

  const handleCSVExport = useCallback(() => {
    if (filteredSignIns.length === 0) {
      setErrorMessage('No sign-ins to export. Please adjust your filters.');
      setShowError(true);
      return;
    }

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
    handleClose();
  }, [filteredSignIns, handleClose]);

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

  const exportCount = filteredSignIns.length;

  // Initialize Google Sheets API
  const initializeExportAPI = async (accessToken: string): Promise<boolean> => {
    try {
      if (typeof window === 'undefined' || !window.gapi) {
        console.error('Google API library not loaded');
        return false;
      }

      const gapi = window.gapi;

      if (!gapi.client) {
        return new Promise((resolve) => {
          gapi.load('client', async () => {
            try {
              await gapi.client.init({
                apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
              });
              
              gapi.client.setToken({ access_token: accessToken });
              resolve(true);
            } catch (error) {
              console.error('Failed to initialize gapi client:', error);
              resolve(false);
            }
          });
        });
      }

      gapi.client.setToken({ access_token: accessToken });
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets API:', error);
      return false;
    }
  };

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

export default React.memo(SignInExportButton);
