import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { SignInRow } from '../types/signIn';
import { signInSheetService } from '../services/SignInSheetService';
import { signInColumnSyncService } from '../services/SignInColumnSyncService';
import { useSettings } from './SettingsContext';

interface SignInSheetContextType {
  signIns: SignInRow[];
  loading: boolean;
  error: string | null;
  fetchSignIns: (accessToken: string) => Promise<void>;
  // Column management methods
  addSheetColumn: (accessToken: string, columnName: string, insertAfterColumn?: number) => Promise<void>;
  renameSheetColumn: (accessToken: string, oldColumnName: string, newColumnName: string) => Promise<void>;
  removeSheetColumn: (accessToken: string, columnName: string) => Promise<void>;
  syncSheetColumns: (accessToken: string, columnSettings: any[]) => Promise<any>;
  getSheetHeaders: (accessToken: string) => Promise<string[]>;
}

const SignInSheetContext = createContext<SignInSheetContextType | undefined>(undefined);

export const SignInSheetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [signIns, setSignIns] = useState<SignInRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { syncDiscoveredSignInCustomColumns, removeDeletedSignInCustomColumns, state: settingsState } = useSettings();

  const fetchSignIns = useCallback(async (accessToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signInSheetService.fetchSignIns(accessToken);
      setSignIns(data);

      // Sync custom columns with settings
      const currentColumnSettings = settingsState.settings.signInDisplay.columnSettings;
      await signInColumnSyncService.syncCustomColumnsWithSettings(
        accessToken,
        currentColumnSettings,
        syncDiscoveredSignInCustomColumns,
        removeDeletedSignInCustomColumns
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sign-in sheet');
    } finally {
      setLoading(false);
    }
  }, [syncDiscoveredSignInCustomColumns, removeDeletedSignInCustomColumns, settingsState.settings.signInDisplay.columnSettings]);

  // Column management methods
  const addSheetColumn = useCallback(async (
    accessToken: string, 
    columnName: string, 
    insertAfterColumn?: number
  ) => {
    try {
      await signInSheetService.addColumn(accessToken, columnName, insertAfterColumn);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add sign-in column';
      setError(errorMessage);
      throw error;
    }
  }, []);

  const renameSheetColumn = useCallback(async (
    accessToken: string,
    oldColumnName: string,
    newColumnName: string
  ) => {
    try {
      await signInSheetService.renameColumn(accessToken, oldColumnName, newColumnName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to rename sign-in column';
      setError(errorMessage);
      throw error;
    }
  }, []);

  const removeSheetColumn = useCallback(async (
    accessToken: string,
    columnName: string
  ) => {
    try {
      await signInSheetService.removeColumn(accessToken, columnName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove sign-in column';
      setError(errorMessage);
      throw error;
    }
  }, []);

  const syncSheetColumns = useCallback(async (
    accessToken: string,
    columnSettings: any[]
  ) => {
    try {
      return await signInSheetService.syncColumnSettings(accessToken, columnSettings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync sign-in columns';
      setError(errorMessage);
      throw error;
    }
  }, []);

  const getSheetHeaders = useCallback(async (accessToken: string) => {
    try {
      return await signInSheetService.getSheetHeaders(accessToken);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get sign-in sheet headers';
      setError(errorMessage);
      throw error;
    }
  }, []);

  return (
    <SignInSheetContext.Provider value={{ 
      signIns, 
      loading, 
      error, 
      fetchSignIns,
      addSheetColumn,
      renameSheetColumn,
      removeSheetColumn,
      syncSheetColumns,
      getSheetHeaders
    }}>
      {children}
    </SignInSheetContext.Provider>
  );
};

export const useSignInSheet = () => {
  const ctx = useContext(SignInSheetContext);
  if (!ctx) throw new Error('useSignInSheet must be used within a SignInSheetProvider');
  return ctx;
};
