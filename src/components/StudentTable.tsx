import React, { useMemo, useState, useCallback } from 'react';
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
} from '@mui/icons-material';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { StudentFormDialog } from './StudentFormDialog.tsx';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog.tsx';
import StudentDetailsDialog from './StudentDetailsDialog';
import ColumnVisibilityButton from './ColumnVisibilityButton';
import type { Student } from '../types';

interface StudentTableProps {
  filteredStudents?: Student[]; // Optional prop for local filtering mode
}

const StudentTable: React.FC<StudentTableProps> = ({ filteredStudents: propFilteredStudents }) => {
  const { state, addStudent, updateStudent, deleteStudent } = useData();
  const { state: authState } = useAuth();
  const { state: settingsState } = useSettings();
  
  // Use prop filteredStudents if provided, otherwise fall back to context
  const filteredStudents = propFilteredStudents || state.filteredStudents;
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

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
      case 'email':
        return {
          ...baseColumn,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
              {params.value}
            </Box>
          ),
        };
      
      case 'cellNumber':
      case 'parentCell':
        return {
          ...baseColumn,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
              {params.value || '-'}
            </Box>
          ),
        };
      
      case 'highSchool':
        return {
          ...baseColumn,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
              {params.value}
            </Box>
          ),
        };
      
      case 'graduationYear':
        return {
          ...baseColumn,
          align: 'center',
          headerAlign: 'center',
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 36 }}>
              {params.value ? params.value.toString() : '-'}
            </Box>
          ),
        };
      
      case 'parentForm':
        return {
          ...baseColumn,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
              <Chip
                label={params.value ? 'Complete' : 'Pending'}
                color={params.value ? 'success' : 'default'}
                variant="outlined"
                size="small"
              />
            </Box>
          ),
        };
      
      case 'careerExploration':
      case 'collegeExploration':
        return {
          ...baseColumn,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
              {params.value ? (
                <Chip
                  label={new Date(params.value).toLocaleDateString()}
                  color="info"
                  variant="outlined"
                  size="small"
                />
              ) : (
                <span style={{ color: '#666' }}>Not completed</span>
              )}
            </Box>
          ),
        };
      
      case 'participationPoints':
        return {
          ...baseColumn,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
              <Chip
                label={params.value || 0}
                color={params.value > 0 ? 'primary' : 'default'}
                variant="filled"
                size="small"
              />
            </Box>
          ),
        };
      
      case 'dob':
        return {
          ...baseColumn,
          renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
              {params.value ? new Date(params.value).toLocaleDateString() : '-'}
            </Box>
          ),
        };
      
      default:
        // For custom columns or simple text fields
        if (columnSetting.isCustom) {
          // Handle custom fields from student.customFields
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
                    {customValue || '-'}
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
    const visibleColumnSettings = settingsState.settings.dataDisplay.columnSettings.filter(col => col.visible);
    
    console.log('🔍 StudentTable: Processing', visibleColumnSettings.length, 'visible columns');
    console.log('🔍 Column fields:', visibleColumnSettings.map(col => `${col.headerName} (${col.field})`));
    
    // Check for duplicates in the visible columns
    const fieldCounts = visibleColumnSettings.reduce((counts, col) => {
      counts[col.field] = (counts[col.field] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const duplicateFields = Object.entries(fieldCounts).filter(([, count]) => count > 1);
    if (duplicateFields.length > 0) {
      console.warn('⚠️ Found duplicate fields in column settings:', duplicateFields);
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
        field: uniqueField
      });
    });
    
    // Always add actions column at the end
    const actionsColumn: GridColDef = {
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
    };

    return [...validatedColumns, actionsColumn];
  }, [settingsState.settings.dataDisplay.columnSettings]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleEdit = useCallback((student: Student) => {
    setSelectedStudent(student);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  }, []);

  const handleAddStudent = useCallback(() => {
    setAddDialogOpen(true);
  }, []);

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

  // Handle row click to show student details
  const handleRowClick = (params: GridRowParams) => {
    setSelectedStudent(params.row as Student);
    setDetailsDialogOpen(true);
  };

  // Memoize the rows transformation to avoid recalculating on every render
  // Only recalculate when filteredStudents actually changes
  const rows = useMemo(() => {
    return filteredStudents.map(student => ({
      ...student,
      id: student.id, // DataGrid requires an 'id' field
    }));
  }, [filteredStudents]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          {/* Table controls could go here if needed */}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <ColumnVisibilityButton />
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
              paginationModel: { 
                page: 0, 
                pageSize: settingsState.settings.dataDisplay.recordsPerPage 
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection={false}
          loading={state.loading}
          onRowClick={handleRowClick}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
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

      {/* Student Details Dialog */}
      <StudentDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
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

export default React.memo(StudentTable);
