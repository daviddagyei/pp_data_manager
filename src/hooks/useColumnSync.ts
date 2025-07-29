import { useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import type { ColumnSettings } from '../contexts/SettingsContext';

/**
 * Custom hook for managing column synchronization between app settings and Google Sheets
 */
export const useColumnSync = () => {
  const { 
    addSheetColumn, 
    renameSheetColumn, 
    removeSheetColumn, 
    syncSheetColumns, 
    getSheetHeaders 
  } = useData();
  const { state: authState } = useAuth();
  const { 
    state: settingsState, 
    addCustomColumn, 
    removeCustomColumn, 
    renameColumn
  } = useSettings();

  /**
   * Add a custom column to both app settings and Google Sheets
   */
  const addColumn = useCallback(async (columnData: Omit<ColumnSettings, 'id' | 'isCustom' | 'order'>) => {
    if (!authState.user?.accessToken) {
      throw new Error('No access token available');
    }

    try {
      // First add to Google Sheets
      await addSheetColumn(authState.user.accessToken, columnData.headerName);
      
      // Then add to app settings
      addCustomColumn(columnData);
      
      return true;
    } catch (error) {
      console.error('Failed to add column:', error);
      throw error;
    }
  }, [authState.user?.accessToken, addSheetColumn, addCustomColumn]);

  /**
   * Remove a custom column from both app settings and Google Sheets
   */
  const removeColumn = useCallback(async (columnId: string) => {
    if (!authState.user?.accessToken) {
      throw new Error('No access token available');
    }

    try {
      // Find the column in settings
      const column = settingsState.settings.dataDisplay.columnSettings.find(col => col.id === columnId);
      if (!column) {
        throw new Error('Column not found in settings');
      }

      // Only remove from Google Sheets if it's a custom column
      if (column.isCustom) {
        await removeSheetColumn(authState.user.accessToken, column.headerName);
      }
      
      // Remove from app settings
      removeCustomColumn(columnId);
      
      return true;
    } catch (error) {
      console.error('Failed to remove column:', error);
      throw error;
    }
  }, [authState.user?.accessToken, removeSheetColumn, removeCustomColumn, settingsState.settings.dataDisplay.columnSettings]);

  /**
   * Rename a column in both app settings and Google Sheets
   */
  const renameColumnSync = useCallback(async (columnId: string, newName: string) => {
    if (!authState.user?.accessToken) {
      throw new Error('No access token available');
    }

    try {
      // Find the column in settings
      const column = settingsState.settings.dataDisplay.columnSettings.find(col => col.id === columnId);
      if (!column) {
        throw new Error('Column not found in settings');
      }

      // Rename in Google Sheets if it's a custom column
      if (column.isCustom) {
        await renameSheetColumn(authState.user.accessToken, column.headerName, newName);
      }
      
      // Rename in app settings
      renameColumn(columnId, newName);
      
      return true;
    } catch (error) {
      console.error('Failed to rename column:', error);
      throw error;
    }
  }, [authState.user?.accessToken, renameSheetColumn, renameColumn, settingsState.settings.dataDisplay.columnSettings]);

  /**
   * Sync all column settings with Google Sheets
   */
  const syncAllColumns = useCallback(async () => {
    if (!authState.user?.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const result = await syncSheetColumns(
        authState.user.accessToken,
        settingsState.settings.dataDisplay.columnSettings
      );
      
      return result;
    } catch (error) {
      console.error('Failed to sync columns:', error);
      throw error;
    }
  }, [authState.user?.accessToken, syncSheetColumns, settingsState.settings.dataDisplay.columnSettings]);

  /**
   * Get current sheet headers
   */
  const getCurrentSheetHeaders = useCallback(async () => {
    if (!authState.user?.accessToken) {
      throw new Error('No access token available');
    }

    try {
      return await getSheetHeaders(authState.user.accessToken);
    } catch (error) {
      console.error('Failed to get sheet headers:', error);
      throw error;
    }
  }, [authState.user?.accessToken, getSheetHeaders]);

  /**
   * Check if columns are in sync between app and Google Sheets
   */
  const checkColumnSync = useCallback(async () => {
    if (!authState.user?.accessToken) {
      return { inSync: false, differences: [] };
    }

    try {
      const sheetHeaders = await getSheetHeaders(authState.user.accessToken);
      const appColumns = settingsState.settings.dataDisplay.columnSettings;
      
      const differences = [];
      
      // Check for columns in app but not in sheet
      for (const column of appColumns.filter(col => col.isCustom)) {
        if (!sheetHeaders.includes(column.headerName)) {
          differences.push({
            type: 'missing_in_sheet',
            column: column.headerName,
            description: `Column "${column.headerName}" exists in app but not in Google Sheets`
          });
        }
      }
      
      // Check for custom columns in sheet but not in app
      const systemColumnNames = appColumns
        .filter(col => !col.isCustom)
        .map(col => col.headerName.toLowerCase());
      
      for (const header of sheetHeaders) {
        const isSystemColumn = systemColumnNames.some(name => 
          header.toLowerCase().includes(name.toLowerCase().replace(/\s+/g, ''))
        );
        
        if (!isSystemColumn) {
          const existsInApp = appColumns.some(col => 
            col.headerName === header && col.isCustom
          );
          
          if (!existsInApp) {
            differences.push({
              type: 'missing_in_app',
              column: header,
              description: `Column "${header}" exists in Google Sheets but not in app`
            });
          }
        }
      }
      
      return {
        inSync: differences.length === 0,
        differences
      };
    } catch (error) {
      console.error('Failed to check column sync:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { inSync: false, differences: [], error: errorMessage };
    }
  }, [authState.user?.accessToken, getSheetHeaders, settingsState.settings.dataDisplay.columnSettings]);

  return {
    addColumn,
    removeColumn,
    renameColumn: renameColumnSync,
    syncAllColumns,
    getCurrentSheetHeaders,
    checkColumnSync,
    isAuthenticated: !!authState.user?.accessToken
  };
};

export default useColumnSync;
