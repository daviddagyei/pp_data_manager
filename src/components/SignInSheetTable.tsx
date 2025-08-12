import React, { useEffect, useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, CircularProgress, Alert, Chip } from '@mui/material';
import { useSignInSheet } from '../contexts/SignInSheetContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import SignInSheetSearchAndFilter from './SignInSheetSearchAndFilter';
import SignInDetailsDialog from './SignInDetailsDialog';
import SignInExportButton from './SignInExportButton';
import SignInColumnVisibilityButton from './SignInColumnVisibilityButton';
import type { SignInRow } from '../types/signIn';


const SignInSheetTable: React.FC = () => {
  const { signIns, loading, error, fetchSignIns } = useSignInSheet();
  const { state: authState } = useAuth();
  const { state: settingsState } = useSettings();
  const [filteredRows, setFilteredRows] = useState<any[]>(signIns);
  const [selectedSignIn, setSelectedSignIn] = useState<SignInRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Function to create column definitions based on settings
  const createColumnFromSettings = (columnSetting: any): GridColDef => {
    const baseColumn: GridColDef = {
      field: columnSetting.field,
      headerName: columnSetting.headerName,
      width: columnSetting.width,
      editable: columnSetting.editable,
      type: columnSetting.type === 'number' ? 'number' : undefined,
    };

    // Add custom rendering based on field type
    switch (columnSetting.field) {
      case 'phone':
        return {
          ...baseColumn,
          renderCell: (params) => {
            const value = params.value;
            if (!value) return <span style={{ color: '#666' }}>-</span>;
            return <Chip label={value} color="secondary" variant="outlined" size="small" />;
          },
        };
      
      case 'email':
        return {
          ...baseColumn,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
              {params.value || '-'}
            </Box>
          ),
        };
      
      case 'date':
        return {
          ...baseColumn,
          renderCell: (params) => {
            const value = params.value;
            if (!value) return <span style={{ color: '#666' }}>-</span>;
            return <span>{value}</span>;
          },
        };
      
      case 'event':
        return {
          ...baseColumn,
          renderCell: (params) => {
            const value = params.value;
            if (!value) return <span style={{ color: '#666' }}>-</span>;
            return <Chip label={value} color="success" variant="outlined" size="small" />;
          },
        };
      
      case 'gradYear':
        return {
          ...baseColumn,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
              {params.value || '-'}
            </Box>
          ),
        };
      
      default:
        // For custom columns or simple text fields
        if (columnSetting.isCustom) {
          // Handle custom fields from signIn.customFields
          return {
            ...baseColumn,
            renderCell: (params) => {
              const customValue = params.row.customFields?.[columnSetting.field];
              
              if (columnSetting.type === 'boolean') {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
                    <Chip
                      label={customValue ? 'Yes' : 'No'}
                      color={customValue ? 'success' : 'default'}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                );
              } else if (columnSetting.type === 'date') {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
                    {customValue ? new Date(customValue).toLocaleDateString() : '-'}
                  </Box>
                );
              } else if (columnSetting.type === 'number') {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
                    {customValue ? customValue.toString() : '-'}
                  </Box>
                );
              } else if (columnSetting.type === 'phone') {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
                    <Chip
                      label={customValue || '-'}
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                );
              } else if (columnSetting.type === 'email') {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
                    {customValue || '-'}
                  </Box>
                );
              }
              
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
                  {customValue || '-'}
                </Box>
              );
            },
          };
        }
        
        // For built-in columns with simple rendering
        if (columnSetting.type === 'boolean') {
          return {
            ...baseColumn,
            renderCell: (params) => (
              <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
                <Chip
                  label={params.value ? 'Yes' : 'No'}
                  color={params.value ? 'success' : 'default'}
                  variant="outlined"
                  size="small"
                />
              </Box>
            ),
          };
        } else if (columnSetting.type === 'date') {
          return {
            ...baseColumn,
            renderCell: (params) => (
              <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
                {params.value ? new Date(params.value).toLocaleDateString() : '-'}
              </Box>
            ),
          };
        }
        
        // For all other columns (including string fields like firstName, lastName), ensure consistent alignment
        return {
          ...baseColumn,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
              {params.value || '-'}
            </Box>
          ),
        };
    }
  };

  const columns: GridColDef[] = useMemo(() => {
    // Get visible columns from settings
    const visibleColumnSettings = settingsState.settings.signInDisplay.columnSettings.filter(col => col.visible);
    
    console.log('🔍 SignInSheetTable: Processing', visibleColumnSettings.length, 'visible columns');
    console.log('🔍 Column fields:', visibleColumnSettings.map(col => `${col.headerName} (${col.field})`));
    
    // Check for duplicates in the visible columns
    const fieldCounts = visibleColumnSettings.reduce((counts, col) => {
      counts[col.field] = (counts[col.field] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const duplicateFields = Object.entries(fieldCounts).filter(([, count]) => count > 1);
    if (duplicateFields.length > 0) {
      console.warn('⚠️ Found duplicate fields in sign-in column settings:', duplicateFields);
    }
    
    // Create columns based on settings
    const dataColumns = visibleColumnSettings.map(createColumnFromSettings);
    
    // Validate unique field names for DataGrid (React keys)
    const seenFields = new Set<string>();
    const validatedColumns: GridColDef[] = [];
    
    dataColumns.forEach((column) => {
      let uniqueField = column.field;
      let counter = 1;
      
      // Ensure unique field name
      while (seenFields.has(uniqueField)) {
        uniqueField = `${column.field}_${counter}`;
        counter++;
        console.warn(`⚠️ Duplicate field detected: "${column.field}", using "${uniqueField}" instead`);
      }
      
      seenFields.add(uniqueField);
      validatedColumns.push({
        ...column,
        field: uniqueField,
      });
    });
    
    return validatedColumns;
  }, [settingsState.settings.signInDisplay.columnSettings]);

  const handleRowClick = (params: any) => {
    setSelectedSignIn(params.row);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSignIn(null);
  };

  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.accessToken) {
      fetchSignIns(authState.user.accessToken);
    }
  }, [authState.isAuthenticated, authState.user?.accessToken, fetchSignIns]);

  // Update filteredRows when signIns change (initial load)
  useEffect(() => {
    setFilteredRows(signIns);
  }, [signIns]);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SignInColumnVisibilityButton />
        </Box>
        <SignInExportButton 
          filteredSignIns={filteredRows}
          disabled={loading}
        />
      </Box>
      <SignInSheetSearchAndFilter
        signIns={signIns}
        onFilter={setFilteredRows}
      />
      <Box sx={{ height: 500, width: '100%', mt: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <DataGrid
            rows={filteredRows.map((row, idx) => ({ ...row, id: idx }))}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            onRowClick={handleRowClick}
            sx={{
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              },
            }}
          />
        )}
      </Box>
      
      <SignInDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        signIn={selectedSignIn}
      />
    </>
  );
};

export default SignInSheetTable;
