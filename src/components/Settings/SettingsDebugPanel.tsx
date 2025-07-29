import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
} from '@mui/material';
import {
  Storage,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { SettingsStorageService } from '../../services/SettingsStorageService';

const SettingsDebugPanel: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: settingsState, resetToDefaults } = useSettings();

  const userEmail = authState.user?.email;
  const hasStoredSettings = userEmail ? SettingsStorageService.hasStoredSettings(userEmail) : false;
  const storageSize = userEmail ? SettingsStorageService.getStorageSize(userEmail) : 0;

  const handleClearUserSettings = () => {
    if (userEmail) {
      SettingsStorageService.clearSettings(userEmail);
      resetToDefaults();
      window.location.reload(); // Refresh to see changes
    }
  };

  const handleClearAllSettings = () => {
    SettingsStorageService.clearAllUserSettings();
    resetToDefaults();
    window.location.reload(); // Refresh to see changes
  };

  const getStorageInfo = () => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('studentApp_settings'));
    return keys.map(key => ({
      key,
      size: new Blob([localStorage.getItem(key) || '']).size
    }));
  };

  const storageInfo = getStorageInfo();

  return (
    <Card variant="outlined" sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Storage color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Settings Storage Debug
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Debug information about settings persistence and storage.
        </Typography>

        <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
          {/* Current User Info */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Current User
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {userEmail || 'Not authenticated'}
            </Typography>
          </Box>

          {/* Storage Status */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Storage Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={hasStoredSettings ? 'Settings Found' : 'No Settings'} 
                color={hasStoredSettings ? 'success' : 'default'}
                size="small"
              />
              <Chip 
                label={`${storageSize} bytes`}
                variant="outlined"
                size="small"
              />
              <Chip 
                label={`${settingsState.settings.dataDisplay.columnSettings.filter(c => c.visible).length} visible columns`}
                color="info"
                size="small"
              />
            </Box>
          </Box>

          {/* All Storage Keys */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              All Settings Storage Keys
            </Typography>
            {storageInfo.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {storageInfo.map(({ key, size }) => (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {key}
                    </Typography>
                    <Chip label={`${size}b`} size="small" variant="outlined" />
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="info" sx={{ py: 1 }}>
                No settings found in localStorage
              </Alert>
            )}
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
            size="small"
          >
            Refresh Page
          </Button>
          
          {userEmail && (
            <Button
              variant="outlined"
              startIcon={<Delete />}
              onClick={handleClearUserSettings}
              color="warning"
              size="small"
            >
              Clear My Settings
            </Button>
          )}
          
          <Button
            variant="outlined"
            startIcon={<Delete />}
            onClick={handleClearAllSettings}
            color="error"
            size="small"
          >
            Clear All Settings
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>How it works:</strong> Settings are now stored per user using the key pattern 
            <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '3px', margin: '0 4px' }}>
              studentApp_settings_{userEmail}
            </code>
            This ensures your column preferences persist even after logout/login.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SettingsDebugPanel;
