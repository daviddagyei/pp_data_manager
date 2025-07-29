import type { AppSettings } from '../contexts/SettingsContext';

const SETTINGS_STORAGE_KEY_PREFIX = 'studentApp_settings';

export class SettingsStorageService {
  /**
   * Get user-specific storage key
   */
  private static getStorageKey(userEmail?: string): string {
    return userEmail ? `${SETTINGS_STORAGE_KEY_PREFIX}_${userEmail}` : SETTINGS_STORAGE_KEY_PREFIX;
  }

  /**
   * Save settings to localStorage for a specific user
   */
  static saveSettings(settings: AppSettings, userEmail?: string): void {
    try {
      const storageKey = this.getStorageKey(userEmail);
      localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      throw new Error('Unable to save settings. Please try again.');
    }
  }

  /**
   * Load settings from localStorage for a specific user
   */
  static loadSettings(userEmail?: string): AppSettings | null {
    try {
      const storageKey = this.getStorageKey(userEmail);
      const storedSettings = localStorage.getItem(storageKey);
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      return null;
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear all settings from localStorage for a specific user
   */
  static clearSettings(userEmail?: string): void {
    try {
      const storageKey = this.getStorageKey(userEmail);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear settings from localStorage:', error);
    }
  }

  /**
   * Check if settings exist in localStorage for a specific user
   */
  static hasStoredSettings(userEmail?: string): boolean {
    try {
      const storageKey = this.getStorageKey(userEmail);
      return localStorage.getItem(storageKey) !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the size of stored settings in bytes for a specific user
   */
  static getStorageSize(userEmail?: string): number {
    try {
      const storageKey = this.getStorageKey(userEmail);
      const settings = localStorage.getItem(storageKey);
      return settings ? new Blob([settings]).size : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Clear all user settings from localStorage (cleanup utility)
   */
  static clearAllUserSettings(): void {
    try {
      const keys = Object.keys(localStorage);
      const settingsKeys = keys.filter(key => key.startsWith(SETTINGS_STORAGE_KEY_PREFIX));
      settingsKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear all user settings:', error);
    }
  }
}
