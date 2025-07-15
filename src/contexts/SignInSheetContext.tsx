import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { SignInRow } from '../types/signIn';
import { signInSheetService } from '../services/SignInSheetService';

interface SignInSheetContextType {
  signIns: SignInRow[];
  loading: boolean;
  error: string | null;
  fetchSignIns: (accessToken: string) => Promise<void>;
}

const SignInSheetContext = createContext<SignInSheetContextType | undefined>(undefined);

export const SignInSheetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [signIns, setSignIns] = useState<SignInRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignIns = useCallback(async (accessToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signInSheetService.fetchSignIns(accessToken);
      setSignIns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sign-in sheet');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SignInSheetContext.Provider value={{ signIns, loading, error, fetchSignIns }}>
      {children}
    </SignInSheetContext.Provider>
  );
};

export const useSignInSheet = () => {
  const ctx = useContext(SignInSheetContext);
  if (!ctx) throw new Error('useSignInSheet must be used within a SignInSheetProvider');
  return ctx;
};
