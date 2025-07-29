import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { DataState, Student, FilterOptions, SortOption } from '../types';
import { googleSheetsService } from '../services/GoogleSheetsService';

interface DataContextType {
  state: DataState;
  fetchStudents: (accessToken: string) => Promise<void>;
  addStudent: (accessToken: string, student: Partial<Student>) => Promise<void>;
  updateStudent: (accessToken: string, student: Student) => Promise<void>;
  deleteStudent: (accessToken: string, studentId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: FilterOptions) => void;
  setSorting: (sort: SortOption) => void;
  refreshData: (accessToken: string) => Promise<void>;
  // Column management methods
  addSheetColumn: (accessToken: string, columnName: string, insertAfterColumn?: number) => Promise<void>;
  renameSheetColumn: (accessToken: string, oldColumnName: string, newColumnName: string) => Promise<void>;
  removeSheetColumn: (accessToken: string, columnName: string) => Promise<void>;
  syncSheetColumns: (accessToken: string, columnSettings: any[]) => Promise<any>;
  getSheetHeaders: (accessToken: string) => Promise<string[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

type DataAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Student[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string } // student ID
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: FilterOptions }
  | { type: 'SET_SORTING'; payload: SortOption }
  | { type: 'APPLY_FILTERS_AND_SEARCH' }
  | { type: 'CLEAR_ERROR' };

const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'FETCH_SUCCESS': {
      const filteredAndSorted = applyFiltersAndSearch(action.payload, state.filters, state.searchQuery);
      return {
        ...state,
        students: action.payload,
        filteredStudents: state.sorting ? applySorting(filteredAndSorted, state.sorting) : filteredAndSorted,
        loading: false,
        error: null,
        lastUpdated: new Date()
      };
    }
    
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case 'ADD_STUDENT': {
      const newStudents = [...state.students, action.payload];
      const newFiltered = applyFiltersAndSearch(newStudents, state.filters, state.searchQuery);
      return {
        ...state,
        students: newStudents,
        filteredStudents: state.sorting ? applySorting(newFiltered, state.sorting) : newFiltered,
        lastUpdated: new Date()
      };
    }
    
    case 'UPDATE_STUDENT': {
      const updatedStudents = state.students.map(student => 
        student.id === action.payload.id ? action.payload : student
      );
      const updatedFiltered = applyFiltersAndSearch(updatedStudents, state.filters, state.searchQuery);
      return {
        ...state,
        students: updatedStudents,
        filteredStudents: state.sorting ? applySorting(updatedFiltered, state.sorting) : updatedFiltered,
        lastUpdated: new Date()
      };
    }
    
    case 'DELETE_STUDENT': {
      const remainingStudents = state.students.filter(student => student.id !== action.payload);
      const remainingFiltered = applyFiltersAndSearch(remainingStudents, state.filters, state.searchQuery);
      return {
        ...state,
        students: remainingStudents,
        filteredStudents: state.sorting ? applySorting(remainingFiltered, state.sorting) : remainingFiltered,
        lastUpdated: new Date()
      };
    }
    
    case 'SET_SEARCH_QUERY': {
      const searchFiltered = applyFiltersAndSearch(state.students, state.filters, action.payload);
      return {
        ...state,
        searchQuery: action.payload,
        filteredStudents: state.sorting ? applySorting(searchFiltered, state.sorting) : searchFiltered
      };
    }
    
    case 'SET_FILTERS': {
      const filterFiltered = applyFiltersAndSearch(state.students, action.payload, state.searchQuery);
      return {
        ...state,
        filters: action.payload,
        filteredStudents: state.sorting ? applySorting(filterFiltered, state.sorting) : filterFiltered
      };
    }
    
    case 'SET_SORTING': {
      const sortedStudents = applySorting(state.filteredStudents, action.payload);
      return {
        ...state,
        sorting: action.payload,
        filteredStudents: sortedStudents
      };
    }
    
    case 'APPLY_FILTERS_AND_SEARCH':
      return {
        ...state,
        filteredStudents: applyFiltersAndSearch(state.students, state.filters, state.searchQuery)
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Helper function to filter students based on search query
// Optimized to return early if no query and use efficient string operations
const filterStudents = (students: Student[], searchQuery: string): Student[] => {
  if (!searchQuery.trim()) {
    return students;
  }
  
  const query = searchQuery.toLowerCase().trim();
  
  return students.filter(student => {
    // Short-circuit evaluation for performance - check most likely matches first
    return student.firstName.toLowerCase().includes(query) ||
           student.lastName.toLowerCase().includes(query) ||
           student.email.toLowerCase().includes(query) ||
           student.highSchool.toLowerCase().includes(query) ||
           (student.parentName?.toLowerCase().includes(query)) ||
           (student.parentEmail?.toLowerCase().includes(query));
  });
};

// Helper function to apply both filters and search
// Optimized to avoid unnecessary array iterations
const applyFiltersAndSearch = (students: Student[], filters: FilterOptions, searchQuery: string): Student[] => {
  let filtered = students;
  
  // Apply filters first (typically reduces the dataset more than search)
  if (filters.graduationYear) {
    filtered = filtered.filter(student => student.graduationYear === filters.graduationYear);
  }
  
  if (filters.highSchool) {
    const schoolQuery = filters.highSchool.toLowerCase();
    filtered = filtered.filter(student => 
      student.highSchool.toLowerCase().includes(schoolQuery)
    );
  }
  
  if (filters.parentFormCompleted !== undefined) {
    filtered = filtered.filter(student => student.parentForm === filters.parentFormCompleted);
  }
  
  if (filters.careerExplorationCompleted !== undefined) {
    filtered = filtered.filter(student => 
      filters.careerExplorationCompleted 
        ? !!student.careerExploration 
        : !student.careerExploration
    );
  }
  
  if (filters.collegeExplorationCompleted !== undefined) {
    filtered = filtered.filter(student => 
      filters.collegeExplorationCompleted 
        ? !!student.collegeExploration 
        : !student.collegeExploration
    );
  }
  
  // Then apply search query to the already filtered results
  if (searchQuery.trim()) {
    filtered = filterStudents(filtered, searchQuery);
  }
  
  return filtered;
};

// Helper function to apply sorting to students
const applySorting = (students: Student[], sortOption: SortOption): Student[] => {
  return [...students].sort((a, b) => {
    const aValue = a[sortOption.field];
    const bValue = b[sortOption.field];
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortOption.direction === 'asc' ? comparison : -comparison;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return sortOption.direction === 'asc' ? comparison : -comparison;
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      const comparison = aValue.getTime() - bValue.getTime();
      return sortOption.direction === 'asc' ? comparison : -comparison;
    }
    
    // Fallback to string comparison
    const aStr = String(aValue || '');
    const bStr = String(bValue || '');
    const comparison = aStr.localeCompare(bStr);
    return sortOption.direction === 'asc' ? comparison : -comparison;
  });
};

const initialState: DataState = {
  students: [],
  loading: false,
  error: null,
  lastUpdated: new Date(),
  filteredStudents: [],
  searchQuery: '',
  filters: {},
  sorting: undefined
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const fetchStudents = useCallback(async (accessToken: string) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const students = await googleSheetsService.fetchStudents(accessToken);
      dispatch({ type: 'FETCH_SUCCESS', payload: students });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch students';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  }, []);

  const addStudent = useCallback(async (accessToken: string, studentData: Partial<Student>) => {
    try {
      const newStudent = await googleSheetsService.addStudent(accessToken, studentData);
      dispatch({ type: 'ADD_STUDENT', payload: newStudent });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add student';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const updateStudent = useCallback(async (accessToken: string, student: Student) => {
    try {
      const updatedStudent = await googleSheetsService.updateStudent(
        accessToken, 
        student.rowIndex, 
        student
      );
      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update student';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const deleteStudent = useCallback(async (accessToken: string, studentId: string) => {
    try {
      const student = state.students.find(s => s.id === studentId);
      if (!student) {
        throw new Error('Student not found');
      }
      
      await googleSheetsService.deleteStudent(accessToken, student.rowIndex);
      dispatch({ type: 'DELETE_STUDENT', payload: studentId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete student';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.students]);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setFilters = useCallback((filters: FilterOptions) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSorting = useCallback((sort: SortOption) => {
    dispatch({ type: 'SET_SORTING', payload: sort });
  }, []);

  const refreshData = useCallback(async (accessToken: string) => {
    await fetchStudents(accessToken);
  }, [fetchStudents]);

  // Column management methods
  const addSheetColumn = useCallback(async (
    accessToken: string, 
    columnName: string, 
    insertAfterColumn?: number
  ) => {
    try {
      await googleSheetsService.addColumn(accessToken, columnName, insertAfterColumn);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add column';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const renameSheetColumn = useCallback(async (
    accessToken: string,
    oldColumnName: string,
    newColumnName: string
  ) => {
    try {
      await googleSheetsService.renameColumn(accessToken, oldColumnName, newColumnName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to rename column';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const removeSheetColumn = useCallback(async (
    accessToken: string,
    columnName: string
  ) => {
    try {
      await googleSheetsService.removeColumn(accessToken, columnName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove column';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const syncSheetColumns = useCallback(async (
    accessToken: string,
    columnSettings: any[]
  ) => {
    try {
      return await googleSheetsService.syncColumnSettings(accessToken, columnSettings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync columns';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const getSheetHeaders = useCallback(async (accessToken: string) => {
    try {
      return await googleSheetsService.getSheetHeaders(accessToken);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get sheet headers';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  // when the state or callbacks haven't actually changed
  const value: DataContextType = useMemo(() => ({
    state,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    setSearchQuery,
    setFilters,
    setSorting,
    refreshData,
    addSheetColumn,
    renameSheetColumn,
    removeSheetColumn,
    syncSheetColumns,
    getSheetHeaders,
  }), [
    state,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    setSearchQuery,
    setFilters,
    setSorting,
    refreshData,
    addSheetColumn,
    renameSheetColumn,
    removeSheetColumn,
    syncSheetColumns,
    getSheetHeaders,
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
