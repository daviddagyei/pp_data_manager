import axios from 'axios';
import type { ColumnSettings } from '../contexts/SettingsContext';

/**
 * Service for managing Google Sheets column structure and metadata
 */
export class GoogleSheetsColumnService {
  private readonly baseUrl = 'https://sheets.googleapis.com/v4';
  private readonly spreadsheetId: string;
  private readonly apiKey: string;
  private readonly sheetName = 'AllScholars';

  constructor() {
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    
    if (!this.spreadsheetId || !this.apiKey) {
      throw new Error('Google Sheets configuration is missing.');
    }
  }

  private getAuthHeaders(accessToken: string) {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get current sheet headers to understand the column structure
   */
  async getSheetHeaders(accessToken: string): Promise<string[]> {
    try {
      const range = `'${this.sheetName}'!1:1`;
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}/values/${range}`;
      
      const response = await axios.get(url, {
        headers: this.getAuthHeaders(accessToken),
        params: { key: this.apiKey }
      });

      return response.data.values?.[0] || [];
    } catch (error) {
      console.error('Error fetching sheet headers:', error);
      throw new Error('Failed to fetch sheet headers');
    }
  }

  /**
   * Get sheet metadata including dimensions
   */
  async getSheetMetadata(accessToken: string): Promise<{
    rowCount: number;
    columnCount: number;
    sheetId: number;
  }> {
    try {
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}`;
      
      const response = await axios.get(url, {
        headers: this.getAuthHeaders(accessToken),
        params: { 
          key: this.apiKey,
          fields: 'sheets.properties'
        }
      });

      const sheet = response.data.sheets?.find((s: any) => 
        s.properties.title === this.sheetName
      );

      if (!sheet) {
        throw new Error(`Sheet '${this.sheetName}' not found`);
      }

      return {
        rowCount: sheet.properties.gridProperties.rowCount,
        columnCount: sheet.properties.gridProperties.columnCount,
        sheetId: sheet.properties.sheetId
      };
    } catch (error) {
      console.error('Error fetching sheet metadata:', error);
      throw new Error('Failed to fetch sheet metadata');
    }
  }

  /**
   * Add a new column to the Google Sheet
   */
  async addColumn(
    accessToken: string, 
    columnName: string, 
    insertAfterColumn?: number
  ): Promise<void> {
    try {
      const metadata = await this.getSheetMetadata(accessToken);
      const headers = await this.getSheetHeaders(accessToken);
      
      // Determine where to insert the column
      const insertIndex = insertAfterColumn !== undefined 
        ? insertAfterColumn + 1 
        : headers.length;

      // First, add a new column to the sheet if needed
      if (insertIndex >= metadata.columnCount) {
        await this.insertColumns(accessToken, metadata.sheetId, metadata.columnCount, 1);
      }

      // Update the header
      await this.updateCellValue(
        accessToken, 
        1, 
        insertIndex + 1, // 1-indexed for Google Sheets
        columnName
      );

      console.log(`Successfully added column '${columnName}' at position ${insertIndex}`);
    } catch (error) {
      console.error('Error adding column:', error);
      throw new Error(`Failed to add column: ${error}`);
    }
  }

  /**
   * Rename a column in the Google Sheet
   */
  async renameColumn(
    accessToken: string,
    oldColumnName: string,
    newColumnName: string
  ): Promise<void> {
    try {
      const headers = await this.getSheetHeaders(accessToken);
      const columnIndex = headers.findIndex(header => 
        header.toLowerCase().trim() === oldColumnName.toLowerCase().trim()
      );

      if (columnIndex === -1) {
        throw new Error(`Column '${oldColumnName}' not found`);
      }

      await this.updateCellValue(
        accessToken,
        1,
        columnIndex + 1, // 1-indexed for Google Sheets
        newColumnName
      );

      console.log(`Successfully renamed column from '${oldColumnName}' to '${newColumnName}'`);
    } catch (error) {
      console.error('Error renaming column:', error);
      throw new Error(`Failed to rename column: ${error}`);
    }
  }

  /**
   * Remove a column from the Google Sheet
   */
  async removeColumn(accessToken: string, columnName: string): Promise<void> {
    try {
      const headers = await this.getSheetHeaders(accessToken);
      const columnIndex = headers.findIndex(header => 
        header.toLowerCase().trim() === columnName.toLowerCase().trim()
      );

      if (columnIndex === -1) {
        throw new Error(`Column '${columnName}' not found`);
      }

      const metadata = await this.getSheetMetadata(accessToken);
      
      // Delete the column
      await this.deleteColumns(accessToken, metadata.sheetId, columnIndex, 1);

      console.log(`Successfully removed column '${columnName}'`);
    } catch (error) {
      console.error('Error removing column:', error);
      throw new Error(`Failed to remove column: ${error}`);
    }
  }

  /**
   * Reorder columns in the Google Sheet
   */
  async reorderColumns(
    accessToken: string,
    newHeaderOrder: string[]
  ): Promise<void> {
    try {
      const currentHeaders = await this.getSheetHeaders(accessToken);
      
      // Validate that all current headers are present in the new order
      const missingHeaders = currentHeaders.filter(header => 
        !newHeaderOrder.includes(header)
      );
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing headers in new order: ${missingHeaders.join(', ')}`);
      }

      // Update the header row with the new order
      const range = `'${this.sheetName}'!1:1`;
      await this.updateRange(accessToken, range, [newHeaderOrder]);

      console.log('Successfully reordered columns');
    } catch (error) {
      console.error('Error reordering columns:', error);
      throw new Error(`Failed to reorder columns: ${error}`);
    }
  }

  /**
   * Sync column settings with Google Sheets structure
   */
  async syncColumnSettings(
    accessToken: string,
    columnSettings: ColumnSettings[]
  ): Promise<{ 
    added: string[]; 
    removed: string[]; 
    renamed: { from: string; to: string }[] 
  }> {
    try {
      const currentHeaders = await this.getSheetHeaders(accessToken);
      const settingsHeaders = columnSettings.map(col => col.headerName);
      
      const added: string[] = [];
      const removed: string[] = [];
      const renamed: { from: string; to: string }[] = [];

      // Find headers that exist in settings but not in sheet (need to be added)
      for (const setting of columnSettings.filter(col => col.isCustom)) {
        if (!currentHeaders.includes(setting.headerName)) {
          await this.addColumn(accessToken, setting.headerName);
          added.push(setting.headerName);
        }
      }

      // Find headers that exist in sheet but not in settings (might need to be removed)
      // We'll be conservative and not auto-remove columns with data
      const potentiallyRemoved = currentHeaders.filter(header => 
        !settingsHeaders.includes(header) && 
        !this.isSystemColumn(header)
      );

      for (const header of potentiallyRemoved) {
        const hasData = await this.columnHasData(accessToken, header);
        if (!hasData) {
          await this.removeColumn(accessToken, header);
          removed.push(header);
        }
      }

      return { added, removed, renamed };
    } catch (error) {
      console.error('Error syncing column settings:', error);
      throw new Error(`Failed to sync column settings: ${error}`);
    }
  }

  /**
   * Check which custom columns from settings are missing in Google Sheets
   */
  async detectMissingCustomColumns(
    accessToken: string,
    columnSettings: ColumnSettings[]
  ): Promise<string[]> {
    try {
      const currentHeaders = await this.getSheetHeaders(accessToken);
      const missingColumns: string[] = [];

      // Check each custom column to see if it exists in Google Sheets
      for (const setting of columnSettings.filter(col => col.isCustom)) {
        if (!currentHeaders.includes(setting.headerName)) {
          missingColumns.push(setting.id);
        }
      }

      return missingColumns;
    } catch (error) {
      console.error('Error detecting missing custom columns:', error);
      throw new Error(`Failed to detect missing custom columns: ${error}`);
    }
  }

  /**
   * Check if a column has any data (excluding header)
   */
  private async columnHasData(accessToken: string, columnName: string): Promise<boolean> {
    try {
      const headers = await this.getSheetHeaders(accessToken);
      const columnIndex = headers.findIndex(h => h === columnName);
      
      if (columnIndex === -1) return false;

      const columnLetter = this.numberToColumn(columnIndex + 1);
      const range = `'${this.sheetName}'!${columnLetter}2:${columnLetter}1000`;
      
      const response = await axios.get(
        `${this.baseUrl}/spreadsheets/${this.spreadsheetId}/values/${range}`,
        {
          headers: this.getAuthHeaders(accessToken),
          params: { key: this.apiKey }
        }
      );

      const values = response.data.values || [];
      return values.some((row: string[]) => 
        row.some(cell => cell && cell.trim() !== '')
      );
    } catch (error) {
      console.error('Error checking column data:', error);
      return true; // Err on the side of caution
    }
  }

  /**
   * Check if a column is a system column that shouldn't be auto-removed
   */
  private isSystemColumn(columnName: string): boolean {
    const systemColumns = [
      'firstname', 'lastname', 'email', 'cellnumber', 'highschool', 
      'graduationyear', 'parentname', 'parentcell', 'parentemail',
      'dob', 'parentform', 'careerexploration', 'collegeexploration',
      'participationpoints', 'spreadsheetsubmitted', 'places'
    ];
    
    return systemColumns.includes(columnName.toLowerCase().replace(/\s+/g, ''));
  }

  /**
   * Insert columns at specified position
   */
  private async insertColumns(
    accessToken: string,
    sheetId: number,
    startIndex: number,
    count: number
  ): Promise<void> {
    const request = {
      insertDimension: {
        range: {
          sheetId,
          dimension: 'COLUMNS',
          startIndex,
          endIndex: startIndex + count
        }
      }
    };

    await this.batchUpdate(accessToken, [request]);
  }

  /**
   * Delete columns at specified position
   */
  private async deleteColumns(
    accessToken: string,
    sheetId: number,
    startIndex: number,
    count: number
  ): Promise<void> {
    const request = {
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'COLUMNS',
          startIndex,
          endIndex: startIndex + count
        }
      }
    };

    await this.batchUpdate(accessToken, [request]);
  }

  /**
   * Update a single cell value
   */
  private async updateCellValue(
    accessToken: string,
    row: number,
    column: number,
    value: string
  ): Promise<void> {
    const columnLetter = this.numberToColumn(column);
    const range = `'${this.sheetName}'!${columnLetter}${row}`;
    
    await this.updateRange(accessToken, range, [[value]]);
  }

  /**
   * Update a range of cells
   */
  private async updateRange(
    accessToken: string,
    range: string,
    values: any[][]
  ): Promise<void> {
    const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}/values/${range}`;
    
    await axios.put(url, {
      values,
      majorDimension: 'ROWS'
    }, {
      headers: this.getAuthHeaders(accessToken),
      params: {
        key: this.apiKey,
        valueInputOption: 'RAW'
      }
    });
  }

  /**
   * Execute batch update requests
   */
  private async batchUpdate(accessToken: string, requests: any[]): Promise<void> {
    const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}:batchUpdate`;
    
    await axios.post(url, {
      requests
    }, {
      headers: this.getAuthHeaders(accessToken),
      params: { key: this.apiKey }
    });
  }

  /**
   * Convert column number to letter (1 = A, 26 = Z, 27 = AA, etc.)
   */
  private numberToColumn(num: number): string {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }
}

export default GoogleSheetsColumnService;
