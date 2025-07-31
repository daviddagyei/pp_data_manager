import React, { useEffect, useState} from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Paper, CircularProgress, Alert, Chip } from '@mui/material';
import { useSignInSheet } from '../contexts/SignInSheetContext';
import { useAuth } from '../contexts/AuthContext';
import SignInSheetSearchAndFilter from './SignInSheetSearchAndFilter';
import SignInDetailsDialog from './SignInDetailsDialog';
import type { SignInRow } from '../types/signIn';


const columns: GridColDef[] = [
  { field: 'firstName', headerName: 'First Name', width: 120 },
  { field: 'lastName', headerName: 'Last Name', width: 120 },
  { field: 'school', headerName: 'School', width: 140 },
  { field: 'phone', headerName: 'Phone', width: 130,
    renderCell: (params) => {
      const value = params.value;
      if (!value) return <span style={{ color: '#666' }}>-</span>;
      return <Chip label={value} color="secondary" variant="outlined" size="small" />;
    },
  },
  { field: 'gradYear', headerName: 'Grad Year', width: 110 },
  { field: 'email', headerName: 'Email', width: 220 },
  { field: 'date', headerName: 'Date', width: 110,
    renderCell: (params) => {
      const value = params.value;
      if (!value) return <span style={{ color: '#666' }}>-</span>;
      return <span>{value}</span>;
    },
  },
  { field: 'event', headerName: 'Event', width: 150,
    renderCell: (params) => {
      const value = params.value;
      if (!value) return <span style={{ color: '#666' }}>-</span>;
      return <Chip label={value} color="success" variant="outlined" size="small" />;
    },
  },
];


const SignInSheetTable: React.FC = () => {
  const { signIns, loading, error, fetchSignIns } = useSignInSheet();
  const { state: authState } = useAuth();
  const [filteredRows, setFilteredRows] = useState<any[]>(signIns);
  const [selectedSignIn, setSelectedSignIn] = useState<SignInRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Sign-In Sheet
      </Typography>
      <SignInSheetSearchAndFilter
        signIns={signIns}
        onFilter={setFilteredRows}
      />
      <Box sx={{ height: 500, width: '100%' }}>
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
    </Paper>
  );
};

export default SignInSheetTable;
