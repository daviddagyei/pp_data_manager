import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  Paper,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useSettings } from '../contexts/SettingsContext';

interface ColumnManagementDialogProps {
  open: boolean;
  onClose: () => void;
}

interface NewColumnData {
  headerName: string;
  field: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'phone';
  required: boolean;
  description: string;
  maxLength?: number;
}

export const ColumnManagementDialog: React.FC<ColumnManagementDialogProps> = ({
  open,
  onClose
}) => {
  const { state: settingsState, addCustomColumn, removeCustomColumn, toggleColumnVisibility } = useSettings();
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newColumn, setNewColumn] = useState<NewColumnData>({
    headerName: '',
    field: '',
    type: 'string',
    required: false,
    description: '',
    maxLength: 255
  });

  const customColumns = settingsState.settings.dataDisplay.columnSettings.filter(col => col.isCustom);

  // Generate field name from header name
  const generateFieldName = (headerName: string): string => {
    return headerName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleHeaderNameChange = (value: string) => {
    setNewColumn(prev => ({
      ...prev,
      headerName: value,
      field: generateFieldName(value)
    }));
  };

  const validateNewColumn = (): string | null => {
    if (!newColumn.headerName.trim()) {
      return 'Column name is required';
    }
    if (!newColumn.field.trim()) {
      return 'Field name is required';
    }
    if (settingsState.settings.dataDisplay.columnSettings.some(col => col.field === newColumn.field)) {
      return 'Field name already exists';
    }
    if (newColumn.type === 'string' && newColumn.maxLength && newColumn.maxLength < 1) {
      return 'Max length must be greater than 0';
    }
    return null;
  };

  const handleAddColumn = async () => {
    const validationError = validateNewColumn();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const columnConfig = {
        field: newColumn.field,
        headerName: newColumn.headerName,
        width: 150,
        editable: true,
        visible: true,
        type: newColumn.type,
        required: newColumn.required,
        description: newColumn.description,
        order: customColumns.length,
        ...(newColumn.type === 'string' && newColumn.maxLength && { maxLength: newColumn.maxLength })
      };

      await addCustomColumn(columnConfig);

      // Reset form
      setNewColumn({
        headerName: '',
        field: '',
        type: 'string',
        required: false,
        description: '',
        maxLength: 255
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add column');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm('Are you sure you want to delete this column? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await removeCustomColumn(columnId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete column');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = (columnId: string) => {
    toggleColumnVisibility(columnId);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      string: 'default',
      number: 'primary',
      boolean: 'secondary',
      date: 'info',
      email: 'success',
      phone: 'warning'
    } as const;
    return colors[type as keyof typeof colors] || 'default';
  };

  const handleClose = () => {
    setShowAddForm(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Manage Custom Columns</Typography>
        <Typography variant="body2" color="text.secondary">
          Add, edit, or remove custom fields for student records
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Add New Column Section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Add New Column</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setShowAddForm(!showAddForm)}
                variant={showAddForm ? 'outlined' : 'contained'}
              >
                {showAddForm ? 'Cancel' : 'Add Column'}
              </Button>
            </Box>

            {showAddForm && (
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
                  <TextField
                    label="Column Name"
                    value={newColumn.headerName}
                    onChange={(e) => handleHeaderNameChange(e.target.value)}
                    placeholder="e.g., Emergency Contact"
                    required
                    disabled={loading}
                  />
                  <TextField
                    label="Field Name"
                    value={newColumn.field}
                    onChange={(e) => setNewColumn(prev => ({ ...prev, field: e.target.value }))}
                    placeholder="Auto-generated"
                    disabled={true}
                    helperText="Auto-generated from header name"
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Field Type</InputLabel>
                    <Select
                      value={newColumn.type}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, type: e.target.value as any }))}
                      disabled={loading}
                    >
                      <MenuItem value="string">Text</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="boolean">Yes/No</MenuItem>
                      <MenuItem value="date">Date</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="phone">Phone</MenuItem>
                    </Select>
                  </FormControl>

                  {newColumn.type === 'string' && (
                    <TextField
                      label="Max Length"
                      type="number"
                      value={newColumn.maxLength}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, maxLength: parseInt(e.target.value) || 255 }))}
                      disabled={loading}
                      inputProps={{ min: 1, max: 1000 }}
                    />
                  )}
                </Box>

                <TextField
                  label="Description (Optional)"
                  value={newColumn.description}
                  onChange={(e) => setNewColumn(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Help text for users"
                  multiline
                  rows={2}
                  disabled={loading}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={newColumn.required}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, required: e.target.checked }))}
                      disabled={loading}
                    />
                  }
                  label="Required field"
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddColumn}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    Add Column
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Existing Columns List */}
          <Typography variant="h6" gutterBottom>
            Custom Columns ({customColumns.length})
          </Typography>

          {customColumns.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                No custom columns yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add your first custom column to get started
              </Typography>
            </Paper>
          ) : (
            <List>
              {customColumns.map((column) => (
                <React.Fragment key={column.id}>
                  <ListItem
                    sx={{
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <IconButton disabled size="small" sx={{ mr: 1 }}>
                      <DragIcon />
                    </IconButton>
                    
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1">{column.headerName}</Typography>
                          <Chip 
                            label={column.type} 
                            size="small" 
                            color={getTypeColor(column.type)}
                          />
                          {column.required && (
                            <Chip label="Required" size="small" color="error" variant="outlined" />
                          )}
                          {!column.visible && (
                            <Chip label="Hidden" size="small" variant="outlined" />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Field: {column.field}
                          </Typography>
                          {column.description && (
                            <Typography variant="caption" color="text.secondary">
                              {column.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => handleToggleVisibility(column.id)}
                        size="small"
                        color={column.visible ? 'primary' : 'default'}
                      >
                        {column.visible ? 'Hide' : 'Show'}
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteColumn(column.id)}
                        size="small"
                        color="error"
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
