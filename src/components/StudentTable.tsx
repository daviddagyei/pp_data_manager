import React, { useMemo, useState } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Chip,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Email,
  Phone,
  School
} from '@mui/icons-material';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { StudentFormDialog } from './StudentFormDialog.tsx';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog.tsx';
import type { Student } from '../types';

const StudentTable: React.FC = () => {
  const { state, addStudent, updateStudent, deleteStudent } = useData();
  const { state: authState } = useAuth();
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'firstName',
      headerName: 'First Name',
      width: 120,
      editable: false,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      width: 120,
      editable: false,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email fontSize="small" color="action" />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'cellNumber',
      headerName: 'Cell Phone',
      width: 130,
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
    },
    {
      field: 'highSchool',
      headerName: 'High School',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <School fontSize="small" color="action" />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'graduationYear',
      headerName: 'Grad Year',
      width: 100,
      renderCell: (params) => (
        <span>{params.value}</span>
      ),
    },
    {
      field: 'parentForm',
      headerName: 'Parent Form',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Complete' : 'Pending'}
          color={params.value ? 'success' : 'default'}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'careerExploration',
      headerName: 'Career Exploration',
      width: 150,
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
    },
    {
      field: 'collegeExploration',
      headerName: 'College Exploration',
      width: 160,
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
    },
    {
      field: 'participationPoints',
      headerName: 'Points',
      width: 80,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={params.value || 0}
          color={params.value > 0 ? 'primary' : 'default'}
          variant="filled"
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Edit Student">
              <Edit />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleEdit(params.row as Student)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Delete Student">
              <Delete />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDelete(params.row as Student)}
        />,
      ],
    },
  ], []);

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setEditDialogOpen(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleAddStudent = () => {
    setAddDialogOpen(true);
  };

  const handleAddSubmit = async (studentData: Omit<Student, 'id' | 'rowIndex' | 'lastModified'>) => {
    if (!authState.user?.accessToken) return;
    
    try {
      await addStudent(authState.user.accessToken, studentData);
      setNotification({
        open: true,
        message: 'Student added successfully!',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to add student. Please try again.',
        severity: 'error'
      });
      throw error; // Re-throw to let dialog handle it
    }
  };

  const handleEditSubmit = async (studentData: Omit<Student, 'id' | 'rowIndex' | 'lastModified'>) => {
    if (!selectedStudent || !authState.user?.accessToken) return;
    
    try {
      const updatedStudent: Student = {
        ...selectedStudent,
        ...studentData,
        lastModified: new Date(),
      };
      await updateStudent(authState.user.accessToken, updatedStudent);
      setNotification({
        open: true,
        message: 'Student updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to update student. Please try again.',
        severity: 'error'
      });
      throw error; // Re-throw to let dialog handle it
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent || !authState.user?.accessToken) return;
    
    try {
      await deleteStudent(authState.user.accessToken, selectedStudent.id);
      setNotification({
        open: true,
        message: 'Student deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to delete student. Please try again.',
        severity: 'error'
      });
      throw error; // Re-throw to let dialog handle it
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Transform students data for DataGrid
  const rows = state.filteredStudents.map(student => ({
    ...student,
    id: student.id, // DataGrid requires an 'id' field
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddStudent}
          >
            Add Student
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          loading={state.loading}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        />
      </Box>

      {/* Add Student Dialog */}
      <StudentFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddSubmit}
        title="Add New Student"
      />

      {/* Edit Student Dialog */}
      <StudentFormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={selectedStudent}
        title="Edit Student"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        student={selectedStudent}
      />

      {/* Success/Error Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentTable;
