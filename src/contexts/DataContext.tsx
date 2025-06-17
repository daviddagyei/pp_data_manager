import React, { createContext, useContext, useReducer, useCallback } from 'react';
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
  | { type: 'SET_FILTERED_STUDENTS'; payload: Student[] }
  | { type: 'CLEAR_ERROR' };

const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'FETCH_SUCCESS':
      return {
        ...state,
        students: action.payload,
        filteredStudents: action.payload,
        loading: false,
        error: null,
        lastUpdated: new Date()
      };
    
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case 'ADD_STUDENT':
      const newStudents = [...state.students, action.payload];
      return {
        ...state,
        students: newStudents,
        filteredStudents: filterStudents(newStudents, state.searchQuery),
        lastUpdated: new Date()
      };
    
    case 'UPDATE_STUDENT':
      const updatedStudents = state.students.map(student => 
        student.id === action.payload.id ? action.payload : student
      );
      return {
        ...state,
        students: updatedStudents,
        filteredStudents: filterStudents(updatedStudents, state.searchQuery),
        lastUpdated: new Date()
      };
    
    case 'DELETE_STUDENT':
      const remainingStudents = state.students.filter(student => student.id !== action.payload);
      return {
        ...state,
        students: remainingStudents,
        filteredStudents: filterStudents(remainingStudents, state.searchQuery),
        lastUpdated: new Date()
      };
    
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
        filteredStudents: filterStudents(state.students, action.payload)
      };
    
    case 'SET_FILTERED_STUDENTS':
      return {
        ...state,
        filteredStudents: action.payload
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
const filterStudents = (students: Student[], searchQuery: string): Student[] => {
  if (!searchQuery.trim()) {
    return students;
  }
  
  const query = searchQuery.toLowerCase().trim();
  
  return students.filter(student => 
    student.firstName.toLowerCase().includes(query) ||
    student.lastName.toLowerCase().includes(query) ||
    student.email.toLowerCase().includes(query) ||
    student.highSchool.toLowerCase().includes(query) ||
    (student.parentName && student.parentName.toLowerCase().includes(query)) ||
    (student.parentEmail && student.parentEmail.toLowerCase().includes(query))
  );
};

const initialState: DataState = {
  students: [],
  loading: false,
  error: null,
  lastUpdated: new Date(),
  filteredStudents: [],
  searchQuery: ''
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const fetchStudents = useCallback(async (accessToken: string) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      // First test basic API access
      console.log('🚀 Starting authentication test...');
      const canAccess = await googleSheetsService.testAPIAccess(accessToken);
      
      if (!canAccess) {
        throw new Error('Unable to access Google Sheets API. Please check your permissions.');
      }
      
      console.log('🎯 Proceeding to fetch student data...');
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
    // Apply filters to students
    let filtered = state.students;
    
    if (filters.graduationYear) {
      filtered = filtered.filter(student => student.graduationYear === filters.graduationYear);
    }
    
    if (filters.highSchool) {
      filtered = filtered.filter(student => 
        student.highSchool.toLowerCase().includes(filters.highSchool!.toLowerCase())
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
    
    // Apply search query if it exists
    if (state.searchQuery) {
      filtered = filterStudents(filtered, state.searchQuery);
    }
    
    dispatch({ type: 'SET_FILTERED_STUDENTS', payload: filtered });
  }, [state.students, state.searchQuery]);

  const setSorting = useCallback((sort: SortOption) => {
    const sorted = [...state.filteredStudents].sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sort.direction === 'asc' ? comparison : -comparison;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sort.direction === 'asc' ? comparison : -comparison;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return sort.direction === 'asc' ? comparison : -comparison;
      }
      
      // Fallback to string comparison
      const aStr = String(aValue || '');
      const bStr = String(bValue || '');
      const comparison = aStr.localeCompare(bStr);
      return sort.direction === 'asc' ? comparison : -comparison;
    });
    
    dispatch({ type: 'SET_FILTERED_STUDENTS', payload: sorted });
  }, [state.filteredStudents]);

  const refreshData = useCallback(async (accessToken: string) => {
    await fetchStudents(accessToken);
  }, [fetchStudents]);

  const value: DataContextType = {
    state,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    setSearchQuery,
    setFilters,
    setSorting,
    refreshData,
  };

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
