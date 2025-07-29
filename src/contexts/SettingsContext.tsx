import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface ColumnSettings {
  id: string;
  field: string;
  headerName: string;
  width: number;
  visible: boolean;
  editable: boolean;
  type: 'string' | 'number' | 'date' | 'boolean';
  isCustom: boolean;
}

export interface DataDisplaySettings {
  recordsPerPage: number;
  visibleColumns: string[];
  columnSettings: ColumnSettings[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface AppSettings {
  dataDisplay: DataDisplaySettings;
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
  | { type: 'REMOVE_CUSTOM_COLUMN'; payload: string }
  | { type: 'UPDATE_COLUMN_SETTINGS'; payload: ColumnSettings }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const defaultColumnSettings: ColumnSettings[] = [
  { id: 'firstName', field: 'firstName', headerName: 'First Name', width: 120, visible: true, editable: false, type: 'string', isCustom: false },
  { id: 'lastName', field: 'lastName', headerName: 'Last Name', width: 120, visible: true, editable: false, type: 'string', isCustom: false },
  { id: 'email', field: 'email', headerName: 'Email', width: 200, visible: true, editable: false, type: 'string', isCustom: false },
  { id: 'cellNumber', field: 'cellNumber', headerName: 'Cell Number', width: 130, visible: true, editable: false, type: 'string', isCustom: false },
  { id: 'highSchool', field: 'highSchool', headerName: 'High School', width: 150, visible: true, editable: false, type: 'string', isCustom: false },
  { id: 'graduationYear', field: 'graduationYear', headerName: 'Grad Year', width: 100, visible: true, editable: false, type: 'number', isCustom: false },
  { id: 'parentForm', field: 'parentForm', headerName: 'Parent Form', width: 120, visible: false, editable: false, type: 'boolean', isCustom: false },
  { id: 'careerExploration', field: 'careerExploration', headerName: 'Career Exploration', width: 150, visible: false, editable: false, type: 'date', isCustom: false },
  { id: 'collegeExploration', field: 'collegeExploration', headerName: 'College Exploration', width: 160, visible: false, editable: false, type: 'date', isCustom: false },
  { id: 'participationPoints', field: 'participationPoints', headerName: 'Points', width: 80, visible: false, editable: false, type: 'number', isCustom: false },
  { id: 'dob', field: 'dob', headerName: 'Date of Birth', width: 120, visible: false, editable: false, type: 'date', isCustom: false },
  { id: 'parentName', field: 'parentName', headerName: 'Parent Name', width: 130, visible: false, editable: false, type: 'string', isCustom: false },
  { id: 'parentCell', field: 'parentCell', headerName: 'Parent Cell', width: 130, visible: false, editable: false, type: 'string', isCustom: false },
  { id: 'parentEmail', field: 'parentEmail', headerName: 'Parent Email', width: 180, visible: false, editable: false, type: 'string', isCustom: false },
];

const defaultSettings: AppSettings = {
  dataDisplay: {
    recordsPerPage: 25,
    visibleColumns: ['firstName', 'lastName', 'email', 'cellNumber', 'highSchool', 'graduationYear'],
    columnSettings: defaultColumnSettings,
    sortBy: 'lastName',
    sortDirection: 'asc',
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

    default:
      return state;
  }
};

interface SettingsContextType {
  state: SettingsState;
  setRecordsPerPage: (count: number) => void;
  toggleColumnVisibility: (columnId: string) => void;
  addCustomColumn: (column: Omit<ColumnSettings, 'id' | 'isCustom'>) => void;
  removeCustomColumn: (columnId: string) => void;
  updateColumnSettings: (column: ColumnSettings) => void;
  resetToDefaults: () => void;
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

  const setRecordsPerPage = (count: number) => {
    dispatch({ type: 'SET_RECORDS_PER_PAGE', payload: count });
  };

  const toggleColumnVisibility = (columnId: string) => {
    dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', payload: columnId });
  };

  const addCustomColumn = (column: Omit<ColumnSettings, 'id' | 'isCustom'>) => {
    const newColumn: ColumnSettings = {
      ...column,
      id: `custom_${Date.now()}`,
      isCustom: true,
      visible: true,
    };
    dispatch({ type: 'ADD_CUSTOM_COLUMN', payload: newColumn });
  };

  const removeCustomColumn = (columnId: string) => {
    dispatch({ type: 'REMOVE_CUSTOM_COLUMN', payload: columnId });
  };

  const updateColumnSettings = (column: ColumnSettings) => {
    dispatch({ type: 'UPDATE_COLUMN_SETTINGS', payload: column });
  };

  const resetToDefaults = () => {
    dispatch({ type: 'SET_SETTINGS', payload: defaultSettings });
  };

  const value: SettingsContextType = {
    state,
    setRecordsPerPage,
    toggleColumnVisibility,
    addCustomColumn,
    removeCustomColumn,
    updateColumnSettings,
    resetToDefaults,
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
