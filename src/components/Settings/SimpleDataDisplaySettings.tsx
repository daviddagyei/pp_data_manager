import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  RestoreRounded,
} from '@mui/icons-material';
import { useDataDisplaySettings } from '../../hooks/useDataDisplaySettings';

const DataDisplaySettings: React.FC = () => {
  const { 
    state, 
    setRecordsPerPage, 
    toggleColumnVisibility, 
    resetToDefaults 
  } = useDataDisplaySettings();

  const { dataDisplay } = state.settings;
  const { recordsPerPage, columnSettings } = dataDisplay;

  const handleRecordsPerPageChange = (event: SelectChangeEvent<number>) => {
    setRecordsPerPage(event.target.value as number);
  };

  const handleToggleColumn = (columnId: string) => {
    toggleColumnVisibility(columnId);
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
  };

  const visibleColumnsCount = columnSettings.filter(col => col.visible).length;
  const defaultColumns = columnSettings.filter(col => !col.isCustom);
  const customColumns = columnSettings.filter(col => col.isCustom);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Data Display Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize how student data is displayed in tables and manage visible columns.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Records Per Page */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Table Pagination
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose how many students to display per page.
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Records Per Page</InputLabel>
              <Select
                value={recordsPerPage}
                label="Records Per Page"
                onChange={handleRecordsPerPageChange}
              >
                <MenuItem value={10}>10 students</MenuItem>
                <MenuItem value={25}>25 students</MenuItem>
                <MenuItem value={50}>50 students</MenuItem>
                <MenuItem value={100}>100 students</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Column Visibility */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Column Visibility
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {visibleColumnsCount} of {columnSettings.length} columns visible
            </Typography>
            
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              <List dense>
                {defaultColumns.map((column) => (
                  <ListItem key={column.id} sx={{ px: 0 }}>
                    <ListItemText 
                      primary={column.headerName}
                      secondary={`${column.width}px width`}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={column.visible}
                        onChange={() => handleToggleColumn(column.id)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Actions */}
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Settings Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your display preferences and restore defaults.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RestoreRounded />}
              onClick={handleResetToDefaults}
              size="small"
            >
              Reset to Defaults
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            Settings are automatically saved and will persist across browser sessions.
          </Alert>

          {/* Custom Columns Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Custom Columns
            </Typography>
            {customColumns.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {customColumns.map((column) => (
                  <Chip
                    key={column.id}
                    label={column.headerName}
                    variant="outlined"
                    color={column.visible ? "primary" : "default"}
                    icon={column.visible ? <Visibility /> : <VisibilityOff />}
                    onClick={() => handleToggleColumn(column.id)}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No custom columns added yet. Custom column functionality will be available in a future update.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DataDisplaySettings;
