import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import SearchAndFilter from './SearchAndFilter';
import StudentTable from './StudentTable';
import { useData } from '../contexts/DataContext';
import type { Student } from '../types';

/**
 * StudentManagement - Wrapper component that manages local filtered state
 * 
 * This component acts as a bridge between the local filtering in SearchAndFilter
 * and the StudentTable component, similar to how SignInSheetTable works.
 * 
 * Architecture:
 * - SearchAndFilter handles local filtering and passes results via callback
 * - This component manages the filtered students state
 * - StudentTable receives the filtered students as props
 * - Eliminates context updates during search/filter operations
 */
const StudentManagement: React.FC = () => {
  const { state } = useData();
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(state.students);

  // Handle filtered results from SearchAndFilter
  const handleFilter = useCallback((filtered: Student[]) => {
    setFilteredStudents(filtered);
  }, []);

  // Update filtered students when raw students data changes (e.g., after CRUD operations)
  React.useEffect(() => {
    setFilteredStudents(state.students);
  }, [state.students]);

  return (
    <Box>
      <SearchAndFilter onFilter={handleFilter} />
      <Box sx={{ mt: 2 }}>
        <StudentTable filteredStudents={filteredStudents} />
      </Box>
    </Box>
  );
};

export default React.memo(StudentManagement);
