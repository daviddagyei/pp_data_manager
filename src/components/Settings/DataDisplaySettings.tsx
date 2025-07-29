import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  Add,
  Delete,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useSettings } from '../../contexts/SettingsContext';

const DataDisplaySettings: React.FC = () => {
  const { state, setRecordsPerPage, toggleColumnVisibility, addCustomColumn, removeCustomColumn } = useSettings();
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'string' | 'number' | 'date' | 'boolean'>('string');
  const [newColumnWidth, setNewColumnWidth] = useState(120);

  const handleRecordsPerPageChange = (event: SelectChangeEvent<number>) => {
    setRecordsPerPage(event.target.value as number);
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      const field = newColumnName.toLowerCase().replace(/\s+/g, '_');
      addCustomColumn({
        field,
        headerName: newColumnName,
        width: newColumnWidth,
        editable: true,
        type: newColumnType,
        visible: true,
      });
      
      // Reset form
      setNewColumnName('');
      setNewColumnType('string');
      setNewColumnWidth(120);
      setAddColumnDialogOpen(false);
    }
  };

  const handleRemoveCustomColumn = (columnId: string) => {
    removeCustomColumn(columnId);
  };

  const visibleColumnsCount = state.settings.dataDisplay.columnSettings.filter(col => col.visible).length;
  const customColumns = state.settings.dataDisplay.columnSettings.filter(col => col.isCustom);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Data Display Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize how student data is displayed in tables and manage custom fields.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Records Per Page */}
        <Card variant="outlined" sx={{ height: '100%' }}>
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
                value={state.settings.dataDisplay.recordsPerPage}
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
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Column Visibility
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {visibleColumnsCount} of {state.settings.dataDisplay.columnSettings.length} columns visible
            </Typography>
            
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              <List dense>
                {state.settings.dataDisplay.columnSettings.map((column) => (
                  <ListItem key={column.id} sx={{ px: 0 }}>
                    <ListItemText 
                      primary={column.headerName}
                      secondary={column.isCustom ? 'Custom field' : 'Default field'}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={column.visible}
                        onChange={() => toggleColumnVisibility(column.id)}
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

      {/* Custom Columns Management */}
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Custom Columns
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add custom fields that will be synced to your Google Sheet.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddColumnDialogOpen(true)}
              size="small"
            >
              Add Column
            </Button>
          </Box>

          {customColumns.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {customColumns.map((column) => (
                <Chip
                  key={column.id}
                  label={column.headerName}
                  variant="outlined"
                  color={column.visible ? "primary" : "default"}
                  deleteIcon={<Delete />}
                  onDelete={() => handleRemoveCustomColumn(column.id)}
                  icon={column.visible ? <Visibility /> : <VisibilityOff />}
                />
              ))}
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              No custom columns added yet. Click "Add Column" to create custom fields that will be added to your Google Sheet.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Add Column Dialog */}
      <Dialog 
        open={addColumnDialogOpen} 
        onClose={() => setAddColumnDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Custom Column</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This will add a new column to your table and create a corresponding field in your Google Sheet.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Column Name"
            fullWidth
            variant="outlined"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., Notes, Status, Priority"
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Data Type</InputLabel>
            <Select
              value={newColumnType}
              label="Data Type"
              onChange={(e) => setNewColumnType(e.target.value as typeof newColumnType)}
            >
              <MenuItem value="string">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="boolean">Yes/No</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Column Width (pixels)"
            type="number"
            fullWidth
            variant="outlined"
            value={newColumnWidth}
            onChange={(e) => setNewColumnWidth(Number(e.target.value))}
            inputProps={{ min: 80, max: 500 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddColumnDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddColumn} 
            variant="contained"
            disabled={!newColumnName.trim()}
          >
            Add Column
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataDisplaySettings;
