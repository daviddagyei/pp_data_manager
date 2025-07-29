import { useContext } from 'react';
import { SettingsContext, type SettingsContextType } from '../contexts/SettingsContext';

export const useDataDisplaySettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  
  if (!context) {
    throw new Error('useDataDisplaySettings must be used within a SettingsProvider');
  }
  
  return context;
};