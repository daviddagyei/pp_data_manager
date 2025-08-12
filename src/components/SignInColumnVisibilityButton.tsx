import React, { useState, useCallback, useMemo } from 'react';
import {
  IconButton,
  Popover,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Divider,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  Settings,
} from '@mui/icons-material';
import { useSettings } from '../contexts/SettingsContext';

interface SignInColumnVisibilityButtonProps {
  onOpenSettings?: () => void;
}

const SignInColumnVisibilityButton: React.FC<SignInColumnVisibilityButtonProps> = ({ onOpenSettings }) => {
  const { state, toggleSignInColumnVisibility } = useSettings();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleToggleVisibility = useCallback((columnId: string) => {
    toggleSignInColumnVisibility(columnId);
  }, [toggleSignInColumnVisibility]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'signin-column-visibility-popover' : undefined;

  const { visibleCount, totalCount } = useMemo(() => ({
    visibleCount: state.settings.signInDisplay.columnSettings.filter(col => col.visible).length,
    totalCount: state.settings.signInDisplay.columnSettings.length
  }), [state.settings.signInDisplay.columnSettings]);

  return (
    <>
      <Tooltip title="Manage column visibility">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ 
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
            }
          }}
        >
          <Visibility />
        </IconButton>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 500,
            overflow: 'auto',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h3">
              Sign-In Columns
            </Typography>
            <Chip 
              label={`${visibleCount}/${totalCount}`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {state.settings.signInDisplay.columnSettings
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((column) => (
              <FormControlLabel
                key={column.id}
                control={
                  <Switch
                    checked={column.visible}
                    onChange={() => handleToggleVisibility(column.id)}
                    size="small"
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {column.headerName}
                    </Typography>
                    {column.isCustom && (
                      <Chip 
                        label="Custom" 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 16 }}
                      />
                    )}
                    {column.required && (
                      <Chip 
                        label="Required" 
                        size="small" 
                        color="error" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 16 }}
                      />
                    )}
                  </Box>
                }
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  margin: 0,
                  width: '100%',
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              />
            ))}
          </Box>
          
          {onOpenSettings && (
            <>
              <Divider sx={{ mt: 2, mb: 2 }} />
              <Button
                startIcon={<Settings />}
                onClick={() => {
                  onOpenSettings();
                  handleClose();
                }}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                Manage Columns
              </Button>
            </>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default SignInColumnVisibilityButton;
