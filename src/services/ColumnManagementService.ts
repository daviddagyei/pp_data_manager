import { googleSheetsService } from './GoogleSheetsService';
import type { ColumnSettings } from '../contexts/SettingsContext';

export class ColumnManagementService {
  /**
   * Add a new column to Google Sheets
   */
  static async addColumnToSheet(
    accessToken: string, 
    column: ColumnSettings,
    _spreadsheetId: string
  ): Promise<boolean> {
    try {
      // First, we need to get the current sheet structure
      await googleSheetsService.fetchStudents(accessToken);
      
      // Find the next available column (this is a simplified approach)
      // In a real implementation, you'd want to inspect the sheet headers
      const columnLetter = this.getNextAvailableColumn();
      
      // Add the header for the new column
      const range = `AllScholars!${columnLetter}1`;
      
      // This is a placeholder - you'd need to implement the actual Google Sheets API call
      // to add a column header. The exact implementation depends on your sheet structure.
      console.log(`Would add column "${column.headerName}" at ${range}`);
      
      return true;
    } catch (error) {
      console.error('Failed to add column to Google Sheets:', error);
      return false;
    }
  }

  /**
   * Remove a column from Google Sheets
   */
  static async removeColumnFromSheet(
    _accessToken: string,
    columnId: string,
    _spreadsheetId: string
  ): Promise<boolean> {
    try {
      // This would implement the actual removal logic
      console.log(`Would remove column "${columnId}" from Google Sheets`);
      return true;
    } catch (error) {
      console.error('Failed to remove column from Google Sheets:', error);
      return false;
    }
  }

  /**
   * Get the next available column letter (simplified)
   */
  private static getNextAvailableColumn(): string {
    // This is a simplified approach. In reality, you'd inspect the current sheet
    // structure to find the next available column.
    // Current columns go up to Q (17 columns), so the next would be R
    return 'R';
  }

  /**
   * Validate if a column name is acceptable
   */
  static validateColumnName(name: string): { valid: boolean; error?: string } {
    if (!name.trim()) {
      return { valid: false, error: 'Column name cannot be empty' };
    }

    if (name.length > 50) {
      return { valid: false, error: 'Column name cannot exceed 50 characters' };
    }

    // Check for special characters that might cause issues
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(name)) {
      return { valid: false, error: 'Column name contains invalid characters' };
    }

    return { valid: true };
  }

  /**
   * Generate a safe field name from a display name
   */
  static generateFieldName(displayName: string): string {
    return displayName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 30); // Limit length
  }
}

export const columnManagementService = new ColumnManagementService();
