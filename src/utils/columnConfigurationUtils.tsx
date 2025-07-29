import React from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import type { ColumnSettings } from '../contexts/SettingsContext';
import { 
  Email, 
  Phone, 
  School,
  Person,
  CalendarToday
} from '@mui/icons-material';
import { Box, Chip } from '@mui/material';

/**
 * Convert ColumnSettings to DataGrid column definitions
 */
export const convertToDataGridColumns = (
  columnSettings: ColumnSettings[],
  includeActions: boolean = true
): GridColDef[] => {
  const visibleColumns = columnSettings.filter(col => col.visible);
  
  const columns: GridColDef[] = visibleColumns.map(col => {
    const baseColumn: GridColDef = {
      field: col.field,
      headerName: col.headerName,
      width: col.width,
      editable: col.editable,
      type: col.type === 'string' ? undefined : col.type,
    };

    // Add custom rendering based on field type
    switch (col.field) {
      case 'email':
        return {
          ...baseColumn,
          renderCell: (params) => (
            params.value ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" color="action" />
                {params.value}
              </Box>
            ) : (
              <span style={{ color: '#666' }}>-</span>
            )
          ),
        };

      case 'cellNumber':
      case 'parentCell':
        return {
          ...baseColumn,
          renderCell: (params) => (
            params.value ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" color="action" />
                {params.value}
              </Box>
            ) : (
              <span style={{ color: '#666' }}>-</span>
            )
          ),
        };

      case 'highSchool':
        return {
          ...baseColumn,
          renderCell: (params) => (
            params.value ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School fontSize="small" color="action" />
                {params.value}
              </Box>
            ) : (
              <span style={{ color: '#666' }}>-</span>
            )
          ),
        };

      case 'dob':
        return {
          ...baseColumn,
          renderCell: (params) => (
            params.value ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday fontSize="small" color="action" />
                {new Date(params.value).toLocaleDateString()}
              </Box>
            ) : (
              <span style={{ color: '#666' }}>-</span>
            )
          ),
        };

      case 'parentName':
        return {
          ...baseColumn,
          renderCell: (params) => (
            params.value ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" color="action" />
                {params.value}
              </Box>
            ) : (
              <span style={{ color: '#666' }}>-</span>
            )
          ),
        };

      case 'parentForm':
        return {
          ...baseColumn,
          renderCell: (params) => (
            <Chip
              label={params.value ? 'Complete' : 'Pending'}
              color={params.value ? 'success' : 'default'}
              variant="outlined"
              size="small"
            />
          ),
        };

      case 'careerExploration':
      case 'collegeExploration':
        return {
          ...baseColumn,
          renderCell: (params) => (
            params.value ? (
              <Chip
                label={new Date(params.value).toLocaleDateString()}
                color="info"
                variant="outlined"
                size="small"
              />
            ) : (
              <span style={{ color: '#666' }}>Not completed</span>
            )
          ),
        };

      case 'participationPoints':
        return {
          ...baseColumn,
          type: 'number',
          renderCell: (params) => (
            <Chip
              label={params.value || 0}
              color={params.value > 0 ? 'primary' : 'default'}
              variant="filled"
              size="small"
            />
          ),
        };

      default:
        return baseColumn;
    }
  });

  return columns;
};

/**
 * Get default column configuration for the student table
 */
export const getDefaultColumnSettings = (): ColumnSettings[] => {
  return [
    { id: 'firstName', field: 'firstName', headerName: 'First Name', width: 120, visible: true, editable: false, type: 'string', isCustom: false },
    { id: 'lastName', field: 'lastName', headerName: 'Last Name', width: 120, visible: true, editable: false, type: 'string', isCustom: false },
    { id: 'email', field: 'email', headerName: 'Email', width: 200, visible: true, editable: false, type: 'string', isCustom: false },
    { id: 'cellNumber', field: 'cellNumber', headerName: 'Cell Number', width: 130, visible: true, editable: false, type: 'string', isCustom: false },
    { id: 'highSchool', field: 'highSchool', headerName: 'High School', width: 150, visible: true, editable: false, type: 'string', isCustom: false },
    { id: 'graduationYear', field: 'graduationYear', headerName: 'Grad Year', width: 100, visible: true, editable: false, type: 'number', isCustom: false },
    { id: 'dob', field: 'dob', headerName: 'Date of Birth', width: 120, visible: false, editable: false, type: 'date', isCustom: false },
    { id: 'parentName', field: 'parentName', headerName: 'Parent Name', width: 130, visible: false, editable: false, type: 'string', isCustom: false },
    { id: 'parentCell', field: 'parentCell', headerName: 'Parent Cell', width: 130, visible: false, editable: false, type: 'string', isCustom: false },
    { id: 'parentEmail', field: 'parentEmail', headerName: 'Parent Email', width: 180, visible: false, editable: false, type: 'string', isCustom: false },
  ];
};

/**
 * Calculate total width of visible columns
 */
export const calculateTableWidth = (columnSettings: ColumnSettings[]): number => {
  return columnSettings
    .filter(col => col.visible)
    .reduce((total, col) => total + col.width, 0);
};

/**
 * Get visible column count
 */
export const getVisibleColumnCount = (columnSettings: ColumnSettings[]): number => {
  return columnSettings.filter(col => col.visible).length;
};

/**
 * Validate column settings
 */
export const validateColumnSettings = (columnSettings: ColumnSettings[]): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Check for duplicate field names
  const fieldNames = columnSettings.map(col => col.field);
  const uniqueFieldNames = new Set(fieldNames);
  if (fieldNames.length !== uniqueFieldNames.size) {
    errors.push('Duplicate column field names detected');
  }
  
  // Check for duplicate IDs
  const ids = columnSettings.map(col => col.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    errors.push('Duplicate column IDs detected');
  }
  
  // Check for at least one visible column
  const visibleCount = getVisibleColumnCount(columnSettings);
  if (visibleCount === 0) {
    errors.push('At least one column must be visible');
  }
  
  // Check for valid widths
  const invalidWidths = columnSettings.filter(col => col.width <= 0);
  if (invalidWidths.length > 0) {
    errors.push('All columns must have a positive width');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
