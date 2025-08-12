import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { GoogleSheetsColumnService } from '../services/GoogleSheetsColumnService';
import { SignInSheetColumnService } from '../services/SignInSheetColumnService';

export interface ColumnSettings {
  id: string;
  field: string;
  headerName: string;
  width: number;
  visible: boolean;
  editable: boolean;
  type: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone';
  isCustom: boolean;
  required?: boolean;
  maxLength?: number;
  description?: string;
  defaultValue?: any;
  order?: number;
}

export interface DataDisplaySettings {
  recordsPerPage: number;
  visibleColumns: string[];
  columnSettings: ColumnSettings[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface SignInDisplaySettings {
  recordsPerPage: number;
  visibleColumns: string[];
  columnSettings: ColumnSettings[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface AppSettings {
  dataDisplay: DataDisplaySettings;
  signInDisplay: SignInDisplaySettings;
  theme: {
    mode: 'light' | 'dark';
    primaryColor: string;
  };
  sync: {
    autoRefreshInterval: number;
    backgroundSync: boolean;
  };
  session: {
    timeout: number; // in minutes
  };
}

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
}

type SettingsAction =
  | { type: 'SET_RECORDS_PER_PAGE'; payload: number }
  | { type: 'TOGGLE_COLUMN_VISIBILITY'; payload: string }
  | { type: 'ADD_CUSTOM_COLUMN'; payload: ColumnSettings }
  | { type: 'ADD_CUSTOM_COLUMNS_BATCH'; payload: ColumnSettings[] }
  | { type: 'REMOVE_CUSTOM_COLUMN'; payload: string }
  | { type: 'UPDATE_COLUMN_SETTINGS'; payload: ColumnSettings }
  | { type: 'RENAME_COLUMN'; payload: { id: string; newName: string; newField?: string } }
  | { type: 'REORDER_COLUMNS'; payload: ColumnSettings[] }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SIGNIN_RECORDS_PER_PAGE'; payload: number }
  | { type: 'TOGGLE_SIGNIN_COLUMN_VISIBILITY'; payload: string }
  | { type: 'ADD_SIGNIN_CUSTOM_COLUMN'; payload: ColumnSettings }
  | { type: 'ADD_SIGNIN_CUSTOM_COLUMNS_BATCH'; payload: ColumnSettings[] }
  | { type: 'REMOVE_SIGNIN_CUSTOM_COLUMN'; payload: string }
  | { type: 'UPDATE_SIGNIN_COLUMN_SETTINGS'; payload: ColumnSettings }
  | { type: 'RENAME_SIGNIN_COLUMN'; payload: { id: string; newName: string; newField?: string } }
  | { type: 'REORDER_SIGNIN_COLUMNS'; payload: ColumnSettings[] };

const defaultColumnSettings: ColumnSettings[] = [
  { id: 'firstName', field: 'firstName', headerName: 'First Name', width: 120, visible: true, editable: false, type: 'string', isCustom: false, required: true, order: 1 },
  { id: 'lastName', field: 'lastName', headerName: 'Last Name', width: 120, visible: true, editable: false, type: 'string', isCustom: false, required: true, order: 2 },
  { id: 'email', field: 'email', headerName: 'Email', width: 200, visible: true, editable: false, type: 'email', isCustom: false, required: true, order: 3 },
  { id: 'cellNumber', field: 'cellNumber', headerName: 'Cell Number', width: 130, visible: true, editable: false, type: 'phone', isCustom: false, order: 4 },
  { id: 'highSchool', field: 'highSchool', headerName: 'High School', width: 150, visible: true, editable: false, type: 'string', isCustom: false, required: true, order: 5 },
  { id: 'graduationYear', field: 'graduationYear', headerName: 'Grad Year', width: 100, visible: true, editable: false, type: 'number', isCustom: false, required: true, order: 6 },
  { id: 'parentForm', field: 'parentForm', headerName: 'Parent Form', width: 120, visible: false, editable: false, type: 'boolean', isCustom: false, order: 7 },
  { id: 'careerExploration', field: 'careerExploration', headerName: 'Career Exploration', width: 150, visible: false, editable: false, type: 'date', isCustom: false, order: 8 },
  { id: 'collegeExploration', field: 'collegeExploration', headerName: 'College Exploration', width: 160, visible: false, editable: false, type: 'date', isCustom: false, order: 9 },
  { id: 'participationPoints', field: 'participationPoints', headerName: 'Points', width: 80, visible: false, editable: false, type: 'number', isCustom: false, order: 10 },
  { id: 'dob', field: 'dob', headerName: 'Date of Birth', width: 120, visible: false, editable: false, type: 'date', isCustom: false, order: 11 },
  { id: 'parentName', field: 'parentName', headerName: 'Parent Name', width: 130, visible: false, editable: false, type: 'string', isCustom: false, order: 12 },
  { id: 'parentCell', field: 'parentCell', headerName: 'Parent Cell', width: 130, visible: false, editable: false, type: 'phone', isCustom: false, order: 13 },
  { id: 'parentEmail', field: 'parentEmail', headerName: 'Parent Email', width: 180, visible: false, editable: false, type: 'email', isCustom: false, order: 14 },
];

const defaultSignInColumnSettings: ColumnSettings[] = [
  { id: 'firstName', field: 'firstName', headerName: 'First Name', width: 120, visible: true, editable: false, type: 'string', isCustom: false, required: true, order: 1 },
  { id: 'lastName', field: 'lastName', headerName: 'Last Name', width: 120, visible: true, editable: false, type: 'string', isCustom: false, required: true, order: 2 },
  { id: 'school', field: 'school', headerName: 'School', width: 140, visible: true, editable: false, type: 'string', isCustom: false, required: true, order: 3 },
  { id: 'phone', field: 'phone', headerName: 'Phone', width: 130, visible: true, editable: false, type: 'phone', isCustom: false, order: 4 },
  { id: 'gradYear', field: 'gradYear', headerName: 'Grad Year', width: 110, visible: true, editable: false, type: 'string', isCustom: false, order: 5 },
  { id: 'email', field: 'email', headerName: 'Email', width: 220, visible: true, editable: false, type: 'email', isCustom: false, required: true, order: 6 },
  { id: 'date', field: 'date', headerName: 'Date', width: 110, visible: true, editable: false, type: 'date', isCustom: false, order: 7 },
  { id: 'event', field: 'event', headerName: 'Event', width: 150, visible: true, editable: false, type: 'string', isCustom: false, order: 8 },
];

const defaultSettings: AppSettings = {
  dataDisplay: {
    recordsPerPage: 25,
    visibleColumns: ['firstName', 'lastName', 'email', 'cellNumber', 'highSchool', 'graduationYear'],
    columnSettings: defaultColumnSettings,
    sortBy: 'lastName',
    sortDirection: 'asc',
  },
  signInDisplay: {
    recordsPerPage: 25,
    visibleColumns: ['firstName', 'lastName', 'school', 'phone', 'gradYear', 'email', 'date', 'event'],
    columnSettings: defaultSignInColumnSettings,
    sortBy: 'date',
    sortDirection: 'desc',
  },
  theme: {
    mode: 'light',
    primaryColor: '#1976d2',
  },
  sync: {
    autoRefreshInterval: 30000, // 30 seconds
    backgroundSync: true,
  },
  session: {
    timeout: 30, // 30 minutes
  },
};

const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'SET_RECORDS_PER_PAGE':
      return {
        ...state,
        settings: {
          ...state.settings,
          dataDisplay: {
            ...state.settings.dataDisplay,
            recordsPerPage: action.payload,
          },
        },
      };

    case 'TOGGLE_COLUMN_VISIBILITY':
      const columnId = action.payload;
      const updatedColumnSettings = state.settings.dataDisplay.columnSettings.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      );
      const visibleColumns = updatedColumnSettings.filter(col => col.visible).map(col => col.id);
      
      return {
        ...state,
        settings: {
          ...state.settings,
          dataDisplay: {
            ...state.settings.dataDisplay,
            columnSettings: updatedColumnSettings,
            visibleColumns,
          },
        },
      };

    case 'ADD_CUSTOM_COLUMN':
      return {
        ...state,
        settings: {
          ...state.settings,
          dataDisplay: {
            ...state.settings.dataDisplay,
            columnSettings: [...state.settings.dataDisplay.columnSettings, action.payload],
            visibleColumns: [...state.settings.dataDisplay.visibleColumns, action.payload.id],
          },
        },
      };

    case 'ADD_CUSTOM_COLUMNS_BATCH':
      // Filter out columns that already exist to prevent duplicates
      const existingSettings = state.settings.dataDisplay.columnSettings;
      const existingIds = new Set(existingSettings.map(col => col.id));
      const existingFields = new Set(existingSettings.map(col => col.field));
      const existingHeaders = new Set(existingSettings.map(col => col.headerName.toLowerCase()));
      
      const filteredNewColumns = action.payload.filter(newCol => {
        const isDuplicate = existingIds.has(newCol.id) || 
                           existingFields.has(newCol.field) || 
                           existingHeaders.has(newCol.headerName.toLowerCase());
        
        if (isDuplicate) {
          console.warn(`🚫 Preventing duplicate column addition: "${newCol.headerName}" (${newCol.field})`);
          return false;
        }
        return true;
      });
      
      if (filteredNewColumns.length === 0) {
        console.log('🚫 All columns in batch already exist, no changes made');
        return state; // No changes needed
      }
      
      const filteredNewColumnIds = filteredNewColumns.map(col => col.id);
      const updatedState = {
        ...state,
        settings: {
          ...state.settings,
          dataDisplay: {
            ...state.settings.dataDisplay,
            columnSettings: [...existingSettings, ...filteredNewColumns],
            visibleColumns: [...state.settings.dataDisplay.visibleColumns, ...filteredNewColumnIds],
          },
        },
      };
      
      // Debug: Check for duplicates after batch add (this should now be clean)
      const allColumns = updatedState.settings.dataDisplay.columnSettings;
      const fieldCounts = allColumns.reduce((counts, col) => {
        counts[col.field] = (counts[col.field] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      const duplicateFields = Object.entries(fieldCounts).filter(([, count]) => count > 1);
      if (duplicateFields.length > 0) {
        console.error('❌ CRITICAL: Duplicate fields still detected after filtering:', duplicateFields);
        console.error('❌ All columns after batch add:', allColumns.map(col => `${col.headerName} (${col.field})`));
      } else {
        console.log(`✅ Successfully added ${filteredNewColumns.length} unique columns`);
      }
      
      return updatedState;

    case 'REMOVE_CUSTOM_COLUMN':
      const filteredColumns = state.settings.dataDisplay.columnSettings.filter(col => col.id !== action.payload);
      const filteredVisibleColumns = state.settings.dataDisplay.visibleColumns.filter(id => id !== action.payload);
      
      return {
        ...state,
        settings: {
          ...state.settings,
          dataDisplay: {
            ...state.settings.dataDisplay,
            columnSettings: filteredColumns,
            visibleColumns: filteredVisibleColumns,
          },
        },
      };

    case 'UPDATE_COLUMN_SETTINGS':
      const updatedColumns = state.settings.dataDisplay.columnSettings.map(col =>
        col.id === action.payload.id ? action.payload : col
      );
      
      return {
        ...state,
        settings: {
          ...state.settings,
          dataDisplay: {
            ...state.settings.dataDisplay,
            columnSettings: updatedColumns,
          },
        },
      };

    case 'RENAME_COLUMN':
      const renamedColumns = state.settings.dataDisplay.columnSettings.map(col =>
        col.id === action.payload.id 
          ? { 
              ...col, 
              headerName: action.payload.newName,
              field: action.payload.newField || col.field
            } 
          : col
      );
      
      return {
        ...state,
        settings: {
          ...state.settings,
          dataDisplay: {
            ...state.settings.dataDisplay,
            columnSettings: renamedColumns,
          },
        },
      };

    case 'REORDER_COLUMNS':
      return {
        ...state,
        settings: {
          ...state.settings,
          dataDisplay: {
            ...state.settings.dataDisplay,
            columnSettings: action.payload,
          },
        },
      };

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    // Sign-In Display Actions
    case 'SET_SIGNIN_RECORDS_PER_PAGE':
      return {
        ...state,
        settings: {
          ...state.settings,
          signInDisplay: {
            ...state.settings.signInDisplay,
            recordsPerPage: action.payload,
          },
        },
      };

    case 'TOGGLE_SIGNIN_COLUMN_VISIBILITY':
      const signInColumnId = action.payload;
      const updatedSignInColumnSettings = state.settings.signInDisplay.columnSettings.map(col =>
        col.id === signInColumnId ? { ...col, visible: !col.visible } : col
      );
      const visibleSignInColumns = updatedSignInColumnSettings.filter(col => col.visible).map(col => col.id);
      
      return {
        ...state,
        settings: {
          ...state.settings,
          signInDisplay: {
            ...state.settings.signInDisplay,
            columnSettings: updatedSignInColumnSettings,
            visibleColumns: visibleSignInColumns,
          },
        },
      };

    case 'ADD_SIGNIN_CUSTOM_COLUMN':
      return {
        ...state,
        settings: {
          ...state.settings,
          signInDisplay: {
            ...state.settings.signInDisplay,
            columnSettings: [...state.settings.signInDisplay.columnSettings, action.payload],
            visibleColumns: [...state.settings.signInDisplay.visibleColumns, action.payload.id],
          },
        },
      };

    case 'ADD_SIGNIN_CUSTOM_COLUMNS_BATCH':
      // Filter out columns that already exist to prevent duplicates
      const existingSignInSettings = state.settings.signInDisplay.columnSettings;
      const existingSignInIds = new Set(existingSignInSettings.map(col => col.id));
      const existingSignInFields = new Set(existingSignInSettings.map(col => col.field));
      const existingSignInHeaders = new Set(existingSignInSettings.map(col => col.headerName.toLowerCase()));
      
      const filteredNewSignInColumns = action.payload.filter(newCol => {
        const isDuplicate = existingSignInIds.has(newCol.id) || 
                           existingSignInFields.has(newCol.field) || 
                           existingSignInHeaders.has(newCol.headerName.toLowerCase());
        
        if (isDuplicate) {
          console.warn(`🚫 Preventing duplicate sign-in column addition: "${newCol.headerName}" (${newCol.field})`);
          return false;
        }
        return true;
      });
      
      if (filteredNewSignInColumns.length === 0) {
        console.log('🚫 All sign-in columns in batch already exist, no changes made');
        return state; // No changes needed
      }
      
      const filteredNewSignInColumnIds = filteredNewSignInColumns.map(col => col.id);
      return {
        ...state,
        settings: {
          ...state.settings,
          signInDisplay: {
            ...state.settings.signInDisplay,
            columnSettings: [...existingSignInSettings, ...filteredNewSignInColumns],
            visibleColumns: [...state.settings.signInDisplay.visibleColumns, ...filteredNewSignInColumnIds],
          },
        },
      };

    case 'REMOVE_SIGNIN_CUSTOM_COLUMN':
      return {
        ...state,
        settings: {
          ...state.settings,
          signInDisplay: {
            ...state.settings.signInDisplay,
            columnSettings: state.settings.signInDisplay.columnSettings.filter(col => col.id !== action.payload),
            visibleColumns: state.settings.signInDisplay.visibleColumns.filter(id => id !== action.payload),
          },
        },
      };

    case 'UPDATE_SIGNIN_COLUMN_SETTINGS':
      const updatedSignInColumns = state.settings.signInDisplay.columnSettings.map(col =>
        col.id === action.payload.id ? action.payload : col
      );
      
      return {
        ...state,
        settings: {
          ...state.settings,
          signInDisplay: {
            ...state.settings.signInDisplay,
            columnSettings: updatedSignInColumns,
          },
        },
      };

    case 'RENAME_SIGNIN_COLUMN':
      const renamedSignInColumns = state.settings.signInDisplay.columnSettings.map(col =>
        col.id === action.payload.id 
          ? { 
              ...col, 
              headerName: action.payload.newName,
              field: action.payload.newField || col.field
            } 
          : col
      );
      
      return {
        ...state,
        settings: {
          ...state.settings,
          signInDisplay: {
            ...state.settings.signInDisplay,
            columnSettings: renamedSignInColumns,
          },
        },
      };

    case 'REORDER_SIGNIN_COLUMNS':
      return {
        ...state,
        settings: {
          ...state.settings,
          signInDisplay: {
            ...state.settings.signInDisplay,
            columnSettings: action.payload,
          },
        },
      };

    default:
      return state;
  }
};

interface SettingsContextType {
  state: SettingsState;
  setRecordsPerPage: (count: number) => void;
  toggleColumnVisibility: (columnId: string) => void;
  addCustomColumn: (column: Omit<ColumnSettings, 'id' | 'isCustom'>) => Promise<void>;
  removeCustomColumn: (columnId: string) => Promise<void>;
  updateColumnSettings: (column: ColumnSettings) => void;
  renameColumn: (id: string, newName: string, newField?: string) => void;
  reorderColumns: (columns: ColumnSettings[]) => void;
  resetToDefaults: () => void;
  syncWithGoogleSheets: () => Promise<void>;
  syncDiscoveredCustomColumns: (discoveredColumns: Array<{id: string, headerName: string, field: string}>) => void;
  syncDiscoveredSignInCustomColumns: (discoveredColumns: Array<{id: string, headerName: string, field: string}>) => void;
  cleanupDuplicateColumns: () => void;
  // Sign-In Display methods
  setSignInRecordsPerPage: (count: number) => void;
  toggleSignInColumnVisibility: (columnId: string) => void;
  addSignInCustomColumn: (column: Omit<ColumnSettings, 'id' | 'isCustom'>) => Promise<void>;
  removeSignInCustomColumn: (columnId: string) => Promise<void>;
  updateSignInColumnSettings: (column: ColumnSettings) => void;
  renameSignInColumn: (id: string, newName: string, newField?: string) => void;
  reorderSignInColumns: (columns: ColumnSettings[]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export { SettingsContext, type SettingsContextType };

const SETTINGS_STORAGE_KEY_PREFIX = 'studentApp_settings';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  
  // Helper function to get user-specific storage key
  const getStorageKey = () => {
    const userEmail = authState.user?.email || 'anonymous';
    return `${SETTINGS_STORAGE_KEY_PREFIX}_${userEmail}`;
  };

  // Helper function to migrate old global settings to user-specific settings
  const migrateOldSettings = () => {
    const oldKey = 'studentApp_settings';
    const oldSettings = localStorage.getItem(oldKey);
    
    if (oldSettings && authState.user?.email) {
      try {
        const userKey = getStorageKey();
        // Only migrate if user doesn't already have settings
        if (!localStorage.getItem(userKey)) {
          localStorage.setItem(userKey, oldSettings);
        }
        // Remove old global settings
        localStorage.removeItem(oldKey);
      } catch (error) {
        console.error('Failed to migrate old settings:', error);
      }
    }
  };

  const [state, dispatch] = useReducer(settingsReducer, {
    settings: defaultSettings,
    loading: false,
    error: null,
  });

  // Load settings from localStorage on mount and when user changes
  useEffect(() => {
    // Only load settings if user is authenticated
    if (!authState.user?.email) return;
    
    // First, migrate any old global settings
    migrateOldSettings();
    
    try {
      const storageKey = getStorageKey();
      const storedSettings = localStorage.getItem(storageKey);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        
        // Merge column settings properly - preserve saved visibility states
        let mergedColumnSettings = defaultColumnSettings;
        let mergedSignInColumnSettings = defaultSignInColumnSettings;
        
        if (parsed.dataDisplay?.columnSettings) {
          // Create a map of saved column settings
          const savedColumnsMap = new Map(
            parsed.dataDisplay.columnSettings.map((col: ColumnSettings) => [col.id, col])
          );
          
          // Update default columns with saved states
          mergedColumnSettings = defaultColumnSettings.map(defaultCol => {
            const savedCol = savedColumnsMap.get(defaultCol.id);
            return savedCol ? { ...defaultCol, ...savedCol } : defaultCol;
          });
          
          // Add any custom columns that don't exist in defaults
          const customColumns = parsed.dataDisplay.columnSettings.filter(
            (col: ColumnSettings) => col.isCustom && !defaultColumnSettings.find(dc => dc.id === col.id)
          );
          mergedColumnSettings = [...mergedColumnSettings, ...customColumns];
        }

        if (parsed.signInDisplay?.columnSettings) {
          // Create a map of saved sign-in column settings
          const savedSignInColumnsMap = new Map(
            parsed.signInDisplay.columnSettings.map((col: ColumnSettings) => [col.id, col])
          );
          
          // Update default sign-in columns with saved states
          mergedSignInColumnSettings = defaultSignInColumnSettings.map(defaultCol => {
            const savedCol = savedSignInColumnsMap.get(defaultCol.id);
            return savedCol ? { ...defaultCol, ...savedCol } : defaultCol;
          });
          
          // Add any custom sign-in columns that don't exist in defaults
          const customSignInColumns = parsed.signInDisplay.columnSettings.filter(
            (col: ColumnSettings) => col.isCustom && !defaultSignInColumnSettings.find(dc => dc.id === col.id)
          );
          mergedSignInColumnSettings = [...mergedSignInColumnSettings, ...customSignInColumns];
        }
        
        // Merge with defaults to ensure new settings are included
        const mergedSettings = {
          ...defaultSettings,
          ...parsed,
          dataDisplay: {
            ...defaultSettings.dataDisplay,
            ...parsed.dataDisplay,
            columnSettings: mergedColumnSettings,
            // Update visibleColumns based on merged column settings
            visibleColumns: mergedColumnSettings.filter(col => col.visible).map(col => col.id),
          },
          signInDisplay: {
            ...defaultSettings.signInDisplay,
            ...parsed.signInDisplay,
            columnSettings: mergedSignInColumnSettings,
            // Update visibleColumns based on merged sign-in column settings
            visibleColumns: mergedSignInColumnSettings.filter(col => col.visible).map(col => col.id),
          },
        };
        
        dispatch({ type: 'SET_SETTINGS', payload: mergedSettings });
      } else {
        // No stored settings found, using defaults
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load user settings' });
    }
  }, [authState.user?.email]); // Re-run when user changes

  // Save settings to localStorage whenever they change
  useEffect(() => {
    // Only save settings if user is authenticated
    if (!authState.user?.email) return;
    
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(state.settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [state.settings, authState.user?.email]); // Re-run when settings or user changes

  // Sync with Google Sheets when user is authenticated and settings are loaded
  useEffect(() => {
    const performSync = async () => {
      // Only sync if user is authenticated and we have custom columns
      if (!authState.user?.accessToken || !authState.isAuthenticated) return;
      
      const hasCustomColumns = state.settings.dataDisplay.columnSettings.some(col => col.isCustom);
      if (!hasCustomColumns) return;

      try {
        await syncWithGoogleSheets();
      } catch (error) {
        console.error('Auto-sync with Google Sheets failed:', error);
      }
    };

    // Add a small delay to ensure settings are fully loaded
    const timeoutId = setTimeout(performSync, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [authState.isAuthenticated, authState.user?.accessToken]); // Only run when auth state changes

  const setRecordsPerPage = (count: number) => {
    dispatch({ type: 'SET_RECORDS_PER_PAGE', payload: count });
  };

  const toggleColumnVisibility = (columnId: string) => {
    dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', payload: columnId });
  };

  const addCustomColumn = async (column: Omit<ColumnSettings, 'id' | 'isCustom'>) => {
    const maxOrder = Math.max(...state.settings.dataDisplay.columnSettings.map(col => col.order || 0));
    const newColumn: ColumnSettings = {
      ...column,
      id: `custom_${Date.now()}`,
      isCustom: true,
      visible: true,
      order: maxOrder + 1,
    };

    // Add to local state first
    dispatch({ type: 'ADD_CUSTOM_COLUMN', payload: newColumn });

    // Sync to Google Sheets
    try {
      if (authState.user?.accessToken) {
        const columnService = new GoogleSheetsColumnService();
        await columnService.addColumn(authState.user.accessToken, newColumn.headerName);
        console.log(`Successfully synced column '${newColumn.headerName}' to Google Sheets`);
      }
    } catch (error) {
      console.error('Failed to sync column to Google Sheets:', error);
      // Optionally show user notification that column was added locally but not synced
    }
  };

  const removeCustomColumn = async (columnId: string) => {
    // Find the column to get its header name before removing it
    const columnToRemove = state.settings.dataDisplay.columnSettings.find((col: ColumnSettings) => col.id === columnId);
    
    if (!columnToRemove) {
      throw new Error('Column not found');
    }

    // Remove from local state first
    dispatch({ type: 'REMOVE_CUSTOM_COLUMN', payload: columnId });

    // Try to remove from Google Sheets if authenticated
    if (authState.user?.accessToken && columnToRemove.isCustom) {
      try {
        const columnService = new GoogleSheetsColumnService();
        await columnService.removeColumn(authState.user.accessToken, columnToRemove.headerName);
        console.log(`Successfully removed column '${columnToRemove.headerName}' from Google Sheets`);
      } catch (error) {
        console.error('Failed to remove column from Google Sheets:', error);
        // Don't throw here - the column was already removed from local state
        // Optionally show user notification that column was removed locally but not synced
      }
    }
  };

  const updateColumnSettings = (column: ColumnSettings) => {
    dispatch({ type: 'UPDATE_COLUMN_SETTINGS', payload: column });
  };

  const renameColumn = (id: string, newName: string, newField?: string) => {
    dispatch({ type: 'RENAME_COLUMN', payload: { id, newName, newField } });
  };

  const reorderColumns = (columns: ColumnSettings[]) => {
    const reorderedColumns = columns.map((col, index) => ({
      ...col,
      order: index + 1,
    }));
    dispatch({ type: 'REORDER_COLUMNS', payload: reorderedColumns });
  };

  const resetToDefaults = () => {
    dispatch({ type: 'SET_SETTINGS', payload: defaultSettings });
  };

  const syncWithGoogleSheets = async () => {
    if (!authState.user?.accessToken) {
      console.warn('Cannot sync: User not authenticated');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const columnService = new GoogleSheetsColumnService();
      const missingColumnIds = await columnService.detectMissingCustomColumns(
        authState.user.accessToken,
        state.settings.dataDisplay.columnSettings
      );

      // Remove missing columns from local settings
      if (missingColumnIds.length > 0) {
        console.log(`Removing ${missingColumnIds.length} missing custom columns:`, missingColumnIds);
        
        for (const columnId of missingColumnIds) {
          dispatch({ type: 'REMOVE_CUSTOM_COLUMN', payload: columnId });
        }
      }
    } catch (error) {
      console.error('Failed to sync with Google Sheets:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sync with Google Sheets' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const syncDiscoveredCustomColumns = (discoveredColumns: Array<{id: string, headerName: string, field: string}>) => {
    if (discoveredColumns.length === 0) {
      return;
    }

    console.log('🔄 syncDiscoveredCustomColumns called with:', discoveredColumns.map(col => `${col.headerName} (${col.field})`));

    // Get current column settings
    const currentSettings = state.settings.dataDisplay.columnSettings;
    console.log('🔄 Current settings before sync:', currentSettings.map(col => `${col.headerName} (${col.field})`));
    
    const existingIds = new Set(currentSettings.map(col => col.id));
    const existingHeaderNames = new Set(currentSettings.map(col => col.headerName.toLowerCase()));
    const existingFields = new Set(currentSettings.map(col => col.field));
    const newColumns: ColumnSettings[] = [];

    discoveredColumns.forEach(({ id, headerName, field }) => {
      // Check for ALL types of collisions: ID, headerName, and field
      const idExists = existingIds.has(id);
      const headerExists = existingHeaderNames.has(headerName.toLowerCase());
      const fieldExists = existingFields.has(field);
      
      console.log(`🔍 Checking column "${headerName}": idExists=${idExists}, headerExists=${headerExists}, fieldExists=${fieldExists}`);
      
      if (!idExists && !headerExists && !fieldExists) {
        const maxOrder = Math.max(...currentSettings.map(col => col.order || 0));
        const newColumn: ColumnSettings = {
          id,
          field,
          headerName,
          type: 'string',
          width: 150,
          visible: true,
          editable: true,
          isCustom: true,
          order: maxOrder + newColumns.length + 1
        };
        newColumns.push(newColumn);
        
        // Add to our tracking sets to prevent duplicates within this batch
        existingIds.add(id);
        existingHeaderNames.add(headerName.toLowerCase());
        existingFields.add(field);
        
        console.log(`✅ Will add new column: "${headerName}" (${field})`);
      } else {
        console.log(`⏭️ Column "${headerName}" already exists (ID: ${idExists}, Header: ${headerExists}, Field: ${fieldExists}), skipping`);
      }
    });

    // Add all new columns at once using a single batch dispatch
    if (newColumns.length > 0) {
      console.log(`🚀 Auto-adding ${newColumns.length} new custom columns:`, newColumns.map(col => col.headerName));
      
      // Use a single batch action instead of multiple dispatches
      dispatch({ type: 'ADD_CUSTOM_COLUMNS_BATCH', payload: newColumns });
    } else {
      console.log('✨ All discovered columns already exist in settings');
    }
  };

  /**
   * Clean up duplicate columns in settings
   */
  const cleanupDuplicateColumns = () => {
    const columns = state.settings.dataDisplay.columnSettings;
    console.log('🧹 Starting cleanup with', columns.length, 'columns');
    console.log('🧹 Current columns:', columns.map(col => `${col.id} (${col.headerName} -> ${col.field})`));
    
    const seen = new Map<string, typeof columns[0]>();
    const duplicatesToRemove: string[] = [];
    
    for (const column of columns) {
      const key = `${column.field.toLowerCase()}_${column.headerName.toLowerCase()}`;
      
      if (!seen.has(key)) {
        seen.set(key, column);
      } else {
        const existing = seen.get(key)!;
        console.log(`🧹 Found duplicate column: ${column.id} (${column.headerName}) - keeping ${existing.id} (${existing.headerName})`);
        duplicatesToRemove.push(column.id);
      }
    }
    
    // Remove duplicates
    duplicatesToRemove.forEach(columnId => {
      console.log(`🧹 Removing duplicate column: ${columnId}`);
      dispatch({ type: 'REMOVE_CUSTOM_COLUMN', payload: columnId });
    });
    
    if (duplicatesToRemove.length > 0) {
      console.log(`🧹 Cleaned up ${duplicatesToRemove.length} duplicate columns`);
    } else {
      console.log('🧹 No duplicates found');
    }
  };

  const syncDiscoveredSignInCustomColumns = (discoveredColumns: Array<{id: string, headerName: string, field: string}>) => {
    if (discoveredColumns.length === 0) {
      return;
    }

    console.log('🔄 syncDiscoveredSignInCustomColumns called with:', discoveredColumns.map(col => `${col.headerName} (${col.field})`));

    // Get current sign-in column settings
    const currentSettings = state.settings.signInDisplay.columnSettings;
    console.log('🔄 Current sign-in settings before sync:', currentSettings.map(col => `${col.headerName} (${col.field})`));
    
    const existingIds = new Set(currentSettings.map(col => col.id));
    const existingHeaderNames = new Set(currentSettings.map(col => col.headerName.toLowerCase()));
    const existingFields = new Set(currentSettings.map(col => col.field));
    const newColumns: ColumnSettings[] = [];

    discoveredColumns.forEach(({ id, headerName, field }) => {
      // Check for ALL types of collisions: ID, headerName, and field
      const idExists = existingIds.has(id);
      const headerExists = existingHeaderNames.has(headerName.toLowerCase());
      const fieldExists = existingFields.has(field);
      
      console.log(`🔍 Checking sign-in column "${headerName}": idExists=${idExists}, headerExists=${headerExists}, fieldExists=${fieldExists}`);
      
      if (!idExists && !headerExists && !fieldExists) {
        const maxOrder = Math.max(...currentSettings.map(col => col.order || 0));
        const newColumn: ColumnSettings = {
          id,
          field,
          headerName,
          type: 'string',
          width: 150,
          visible: true,
          editable: true,
          isCustom: true,
          order: maxOrder + newColumns.length + 1
        };
        newColumns.push(newColumn);
        
        // Add to our tracking sets to prevent duplicates within this batch
        existingIds.add(id);
        existingHeaderNames.add(headerName.toLowerCase());
        existingFields.add(field);
        
        console.log(`✅ Will add new sign-in column: "${headerName}" (${field})`);
      } else {
        console.log(`⏭️ Sign-in column "${headerName}" already exists (ID: ${idExists}, Header: ${headerExists}, Field: ${fieldExists}), skipping`);
      }
    });

    // Add all new columns at once using a single batch dispatch
    if (newColumns.length > 0) {
      console.log(`🚀 Auto-adding ${newColumns.length} new sign-in custom columns:`, newColumns.map(col => col.headerName));
      
      // Use a single batch action instead of multiple dispatches
      dispatch({ type: 'ADD_SIGNIN_CUSTOM_COLUMNS_BATCH', payload: newColumns });
    } else {
      console.log('✨ All discovered sign-in columns already exist in settings');
    }
  };

  // Sign-In Display Methods
  const setSignInRecordsPerPage = (count: number) => {
    dispatch({ type: 'SET_SIGNIN_RECORDS_PER_PAGE', payload: count });
  };

  const toggleSignInColumnVisibility = (columnId: string) => {
    dispatch({ type: 'TOGGLE_SIGNIN_COLUMN_VISIBILITY', payload: columnId });
  };

  const addSignInCustomColumn = async (column: Omit<ColumnSettings, 'id' | 'isCustom'>) => {
    const maxOrder = Math.max(...state.settings.signInDisplay.columnSettings.map(col => col.order || 0));
    const newColumn: ColumnSettings = {
      ...column,
      id: `signin_custom_${Date.now()}`,
      isCustom: true,
      visible: true,
      order: maxOrder + 1,
    };

    // Add to local state first
    dispatch({ type: 'ADD_SIGNIN_CUSTOM_COLUMN', payload: newColumn });

    // Sync to Sign-In Google Sheets
    try {
      if (authState.user?.accessToken) {
        const columnService = new SignInSheetColumnService();
        await columnService.addColumn(authState.user.accessToken, newColumn.headerName);
        console.log(`Successfully synced sign-in column '${newColumn.headerName}' to Google Sheets`);
      }
    } catch (error) {
      console.error('Failed to sync sign-in column to Google Sheets:', error);
      // Optionally show user notification that column was added locally but not synced
    }
  };

  const removeSignInCustomColumn = async (columnId: string) => {
    const columnToRemove = state.settings.signInDisplay.columnSettings.find((col: ColumnSettings) => col.id === columnId);
    
    if (!columnToRemove) {
      throw new Error('Sign-in column not found');
    }

    // Remove from local state first
    dispatch({ type: 'REMOVE_SIGNIN_CUSTOM_COLUMN', payload: columnId });

    // Try to remove from Sign-In Google Sheets if authenticated
    if (authState.user?.accessToken && columnToRemove.isCustom) {
      try {
        const columnService = new SignInSheetColumnService();
        await columnService.removeColumn(authState.user.accessToken, columnToRemove.headerName);
        console.log(`Successfully removed sign-in column '${columnToRemove.headerName}' from Google Sheets`);
      } catch (error) {
        console.error('Failed to remove sign-in column from Google Sheets:', error);
        // Don't throw here - the column was already removed from local state
        // Optionally show user notification that column was removed locally but not synced
      }
    }
  };

  const updateSignInColumnSettings = (column: ColumnSettings) => {
    dispatch({ type: 'UPDATE_SIGNIN_COLUMN_SETTINGS', payload: column });
  };

  const renameSignInColumn = (id: string, newName: string, newField?: string) => {
    dispatch({ type: 'RENAME_SIGNIN_COLUMN', payload: { id, newName, newField } });
  };

  const reorderSignInColumns = (columns: ColumnSettings[]) => {
    const reorderedColumns = columns.map((col, index) => ({
      ...col,
      order: index + 1,
    }));
    dispatch({ type: 'REORDER_SIGNIN_COLUMNS', payload: reorderedColumns });
  };

  const value: SettingsContextType = {
    state,
    setRecordsPerPage,
    toggleColumnVisibility,
    addCustomColumn,
    removeCustomColumn,
    updateColumnSettings,
    renameColumn,
    reorderColumns,
    resetToDefaults,
    syncWithGoogleSheets,
    syncDiscoveredCustomColumns,
    syncDiscoveredSignInCustomColumns,
    cleanupDuplicateColumns,
    // Sign-In methods
    setSignInRecordsPerPage,
    toggleSignInColumnVisibility,
    addSignInCustomColumn,
    removeSignInCustomColumn,
    updateSignInColumnSettings,
    renameSignInColumn,
    reorderSignInColumns,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
