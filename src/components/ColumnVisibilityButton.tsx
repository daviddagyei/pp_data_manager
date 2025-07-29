import React, { useState } from 'react';
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
  VisibilityOff,
  Settings,
} from '@mui/icons-material';
import { useSettings } from '../contexts/SettingsContext';

interface ColumnVisibilityButtonProps {
  onOpenSettings?: () => void;
}

const ColumnVisibilityButton: React.FC<ColumnVisibilityButtonProps> = ({ onOpenSettings }) => {
  const { state, toggleColumnVisibility } = useSettings();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'column-visibility-popover' : undefined;

  const visibleCount = state.settings.dataDisplay.columnSettings.filter(col => col.visible).length;
  const totalCount = state.settings.dataDisplay.columnSettings.length;

  return (
    <>
      <Tooltip title="Column Visibility" arrow>
        <IconButton
          onClick={handleClick}
          sx={{
            color: 'primary.main',
            bgcolor: 'primary.50',
            '&:hover': {
              bgcolor: 'primary.100',
            },
          }}
          size="small"
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
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            p: 2,
            minWidth: 280,
            maxHeight: 400,
            overflowY: 'auto',
          },
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Column Visibility
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {visibleCount} of {totalCount} columns visible
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
          {state.settings.dataDisplay.columnSettings.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Switch
                  checked={column.visible}
                  onChange={() => toggleColumnVisibility(column.id)}
                  size="small"
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
                      variant="outlined" 
                      color="secondary"
                      sx={{ fontSize: '0.7rem', height: '20px' }}
                    />
                  )}
                  {column.visible ? (
                    <Visibility fontSize="small" color="action" />
                  ) : (
                    <VisibilityOff fontSize="small" color="disabled" />
                  )}
                </Box>
              }
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                mr: 0,
                mb: 1,
                '& .MuiFormControlLabel-label': {
                  flex: 1,
                },
              }}
            />
          ))}
        </Box>

        {onOpenSettings && (
          <>
            <Divider sx={{ my: 2 }} />
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => {
                onOpenSettings();
                handleClose();
              }}
              size="small"
            >
              Advanced Settings
            </Button>
          </>
        )}
      </Popover>
    </>
  );
};

export default ColumnVisibilityButton;
