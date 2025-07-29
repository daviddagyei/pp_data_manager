import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useDataDisplaySettings } from '../../hooks/useDataDisplaySettings';

const DataDisplaySettings: React.FC = () => {
  const { 
    state, 
    setRecordsPerPage, 
    toggleColumnVisibility
  } = useDataDisplaySettings();

  const { dataDisplay } = state.settings;
  const { recordsPerPage, columnSettings } = dataDisplay;

  const handleRecordsPerPageChange = (event: SelectChangeEvent<number>) => {
    setRecordsPerPage(event.target.value as number);
  };

  const handleToggleColumn = (columnId: string) => {
    toggleColumnVisibility(columnId);
  };

  const visibleColumnsCount = columnSettings.filter(col => col.visible).length;
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
                {columnSettings.map((column) => (
                  <ListItem key={column.id} sx={{ px: 0 }}>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{column.headerName}</span>
                          {column.isCustom && (
                            <Chip 
                              label="Custom" 
                              size="small" 
                              variant="outlined" 
                              sx={{ fontSize: '0.6rem', height: 16 }} 
                            />
                          )}
                        </Box>
                      }
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

      {/* Custom Columns Section */}
      <Card variant="outlined">
        <CardContent>
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
                No custom columns added yet.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DataDisplaySettings;
