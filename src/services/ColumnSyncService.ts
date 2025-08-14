import { GoogleSheetsColumnService } from './GoogleSheetsColumnService';
import { DataTransformService } from './DataTransformService';

/**
 * Service for synchronizing custom column definitions across users
 */
export class ColumnSyncService {
  private columnService: GoogleSheetsColumnService;
  private lastSyncTime: number = 0;
  private syncCooldownMs: number = 1000; // 1 second cooldown

  constructor() {
    this.columnService = new GoogleSheetsColumnService();
  }

  /**
   * Detect columns that exist in settings but no longer exist in Google Sheets
   */
  async detectDeletedCustomColumns(
    accessToken: string,
    currentColumnSettings: Array<{id: string, headerName: string, field: string}>
  ): Promise<Array<{id: string, headerName: string, field: string}>> {
    try {
      // Get current headers from Google Sheets
      const headers = await this.columnService.getSheetHeaders(accessToken);
      console.log('📋 Sheet headers for deletion check:', headers);
      
      // Detect all custom columns currently in the sheet
      const currentSheetColumns = DataTransformService.detectCustomColumns(headers);
      console.log('🔍 Current sheet custom columns:', currentSheetColumns);
      
      // Create sets for sheet column identifiers
      const sheetHeaders = new Set(currentSheetColumns.map(col => col.headerName.toLowerCase()));
      const sheetFields = new Set(currentSheetColumns.map(col => col.field));
      
      // Find columns in settings that no longer exist in the sheet
      const deletedColumns = currentColumnSettings.filter(settingCol => {
        // Skip standard columns - only check custom columns
        const isCustomColumn = settingCol.field.startsWith('custom_');
        if (!isCustomColumn) return false;
        
        const headerExists = sheetHeaders.has(settingCol.headerName.toLowerCase());
        const fieldExists = sheetFields.has(settingCol.field);
        
        console.log(`🔎 Checking deletion for "${settingCol.headerName}": headerExists=${headerExists}, fieldExists=${fieldExists}`);
        
        return !headerExists && !fieldExists;
      });
      
      if (deletedColumns.length > 0) {
        console.log(`🗑️ Detected ${deletedColumns.length} deleted custom columns:`, deletedColumns.map(col => col.headerName));
      } else {
        console.log('ℹ️ No deleted custom columns detected');
      }
      
      return deletedColumns;
    } catch (error) {
      console.error('❌ Error detecting deleted custom columns:', error);
      return [];
    }
  }

  /**
   * Detect and return new custom columns from Google Sheets headers
   * that don't exist in the current column settings
   */
  async detectNewCustomColumns(
    accessToken: string,
    currentColumnSettings: Array<{id: string, headerName: string, field: string}>
  ): Promise<Array<{id: string, headerName: string, field: string}>> {
    try {
      // Get current headers from Google Sheets
      const headers = await this.columnService.getSheetHeaders(accessToken);
      console.log('📋 Sheet headers:', headers);
      
      // Detect all custom columns from headers
      const discoveredColumns = DataTransformService.detectCustomColumns(headers);
      console.log('🔍 Discovered custom columns:', discoveredColumns);
      
      // Create sets for ALL types of existing identifiers
      const existingIds = new Set(currentColumnSettings.map(col => col.id));
      const existingHeaders = new Set(currentColumnSettings.map(col => col.headerName.toLowerCase()));
      const existingFields = new Set(currentColumnSettings.map(col => col.field));
      
      console.log('📊 Existing IDs:', Array.from(existingIds));
      console.log('📊 Existing headers:', Array.from(existingHeaders));
      console.log('📊 Existing fields:', Array.from(existingFields));
      
      // Filter out columns that exist by ANY identifier (ID, header, or field)
      const newColumns = discoveredColumns.filter(col => {
        const idExists = existingIds.has(col.id);
        const headerExists = existingHeaders.has(col.headerName.toLowerCase());
        const fieldExists = existingFields.has(col.field);
        
        console.log(`🔎 Column "${col.headerName}": idExists=${idExists}, headerExists=${headerExists}, fieldExists=${fieldExists}`);
        
        return !idExists && !headerExists && !fieldExists;
      });
      
      if (newColumns.length > 0) {
        console.log(`✨ Detected ${newColumns.length} new custom columns:`, newColumns.map(col => col.headerName));
      } else {
        console.log('ℹ️ No new custom columns detected');
      }
      
      return newColumns;
    } catch (error) {
      console.error('❌ Error detecting new custom columns:', error);
      return [];
    }
  }

  /**
   * Sync discovered custom columns with local settings
   * This should be called whenever data is fetched to ensure all users see the same columns
   */
  async syncCustomColumnsWithSettings(
    accessToken: string,
    currentColumnSettings: Array<{id: string, headerName: string, field: string}>,
    addColumnsCallback: (discoveredColumns: Array<{id: string, headerName: string, field: string}>) => void,
    removeColumnsCallback?: (deletedColumns: Array<{id: string, headerName: string, field: string}>) => void
  ): Promise<void> {
    try {
      const now = Date.now();
      
      // Prevent rapid successive sync calls
      if (now - this.lastSyncTime < this.syncCooldownMs) {
        console.log(`🚫 Column sync skipped - cooldown active (${this.syncCooldownMs - (now - this.lastSyncTime)}ms remaining)`);
        return;
      }
      
      this.lastSyncTime = now;
      
      console.log('🔄 Starting column sync...');
      console.log('Current column settings:', currentColumnSettings.length, 'columns');
      
      // Check for deleted columns first
      if (removeColumnsCallback) {
        const deletedColumns = await this.detectDeletedCustomColumns(accessToken, currentColumnSettings);
        
        if (deletedColumns.length > 0) {
          console.log('🗑️ Found deleted columns to remove:', deletedColumns);
          removeColumnsCallback(deletedColumns);
          console.log('✅ Column deletion callback completed');
        }
      }
      
      // Then check for new columns
      const newColumns = await this.detectNewCustomColumns(accessToken, currentColumnSettings);
      
      if (newColumns.length > 0) {
        console.log('✅ Found new columns to sync:', newColumns);
        
        // Additional validation to prevent duplicates at sync level
        const finalColumns = newColumns.filter((newCol, index, self) => {
          // Remove duplicates within the new columns array itself
          const isDuplicate = self.findIndex(col => 
            col.id === newCol.id || 
            col.field === newCol.field || 
            col.headerName.toLowerCase() === newCol.headerName.toLowerCase()
          ) !== index;
          
          if (isDuplicate) {
            console.warn(`⚠️ Removing duplicate within new columns batch: ${newCol.headerName}`);
            return false;
          }
          return true;
        });
        
        if (finalColumns.length > 0) {
          console.log('✅ Syncing', finalColumns.length, 'validated new columns');
          addColumnsCallback(finalColumns);
          console.log('✅ Column sync callback completed');
        } else {
          console.log('ℹ️ All new columns were duplicates, skipping sync');
        }
      } else {
        console.log('ℹ️ No new columns to sync');
      }
    } catch (error) {
      console.error('❌ Error syncing custom columns:', error);
    }
  }
}

export const columnSyncService = new ColumnSyncService();
