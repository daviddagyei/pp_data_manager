import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { Student, GoogleSheetsResponse, SheetMetadata, BatchUpdate } from '../types';
import { DataTransformService } from './DataTransformService';
import { GoogleSheetsColumnService } from './GoogleSheetsColumnService';

class GoogleSheetsService {
  private readonly baseUrl = 'https://sheets.googleapis.com/v4';
  private readonly spreadsheetId: string;
  private readonly apiKey: string;
  private readonly columnService: GoogleSheetsColumnService;
  
  constructor() {
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    this.columnService = new GoogleSheetsColumnService();
    
    // Debug logging for environment variables
    console.log('Environment variables check:', {
      spreadsheetId: this.spreadsheetId ? 'Set' : 'Missing',
      apiKey: this.apiKey ? 'Set' : 'Missing',
      allEnvVars: import.meta.env
    });
    
    if (!this.spreadsheetId || !this.apiKey) {
      const missingVars = [];
      if (!this.spreadsheetId) missingVars.push('VITE_GOOGLE_SHEETS_ID');
      if (!this.apiKey) missingVars.push('VITE_GOOGLE_API_KEY');
      
      throw new Error(`Google Sheets configuration is missing. Missing variables: ${missingVars.join(', ')}. Please check your environment variables in Netlify dashboard.`);
    }
  }

  private getAuthHeaders(accessToken: string) {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Fetch all student data from the Google Sheet
   */
  async fetchStudents(accessToken: string): Promise<Student[]> {
    try {
      const range = "'AllScholars'!A1:Q1000"; // Updated sheet name and quoted
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}/values/${range}`;
      
      const response: AxiosResponse<GoogleSheetsResponse> = await axios.get(url, {
        headers: this.getAuthHeaders(accessToken),
        params: {
          key: this.apiKey
        }
      });

      const { values } = response.data;
      
      if (!values || values.length === 0) {
        return [];
      }
      
      return DataTransformService.transformSheetsDataToStudents(values);
    } catch (error) {
      // Log to a dedicated logging service in production
      console.error('Error fetching students:', error);
      if (axios.isAxiosError(error)) {
        // Optionally log more details from error.response, error.config
      }
      throw error;
    }
  }

  /**
   * Add a new student to the Google Sheet with dynamic column support
   */
  async addStudent(accessToken: string, student: Partial<Student>): Promise<Student> {
    try {
      // Get current headers to ensure we write to the correct columns
      const headers = await this.columnService.getSheetHeaders(accessToken);
      
      const range = 'AllScholars'; // Updated sheet name for append
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}/values/${range}:append`;
      
      // Use dynamic transformation based on current sheet structure
      const rowData = DataTransformService.transformStudentToSheetsRowDynamic(
        student as Student, 
        headers
      );
      
      const response = await axios.post(url, {
        values: [rowData],
        majorDimension: 'ROWS'
      }, {
        headers: this.getAuthHeaders(accessToken),
        params: {
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
        }
      });

      const newStudent: Student = {
        ...student as Student,
        id: this.generateStudentIdInternal(),
        rowIndex: this.getRowIndexFromResponse(response.data), 
        lastModified: new Date(),
        customFields: student.customFields || {}
      };

      return newStudent;
    } catch (error) {
      console.error('Error adding student:', error);
      // Optionally log more details from error.response
      throw error;
    }
  }

  /**
   * Update an existing student in the Google Sheet
   */
  async updateStudent(accessToken: string, rowIndex: number, student: Partial<Student>): Promise<Student> {
    try {
      // Get current headers to ensure we write to the correct columns
      const headers = await this.columnService.getSheetHeaders(accessToken);
      
      // Calculate the range dynamically based on the number of columns
      const endColumn = this.numberToColumnLetter(headers.length);
      const range = `'AllScholars'!A${rowIndex}:${endColumn}${rowIndex}`;
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}/values/${range}`;
      
      // Use dynamic transformation based on current sheet structure
      const rowData = DataTransformService.transformStudentToSheetsRowDynamic(
        student as Student, 
        headers
      );
      
      await axios.put(url, {
        values: [rowData],
        majorDimension: 'ROWS'
      }, {
        headers: this.getAuthHeaders(accessToken),
        params: {
          valueInputOption: 'USER_ENTERED',
        }
      });

      return {
        ...student as Student,
        rowIndex,
        lastModified: new Date(),
        customFields: student.customFields || {}
      };
    } catch (error) {
      console.error('Error updating student:', error);
      // Optionally log more details from error.response
      throw error;
    }
  }

  /**
   * Delete a student from the Google Sheet
   */
  async deleteStudent(accessToken: string, rowIndex: number): Promise<void> {
    try {
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}:batchUpdate`;
      
      const requestBody = {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: await this.getSheetIdByName(accessToken, 'AllScholars'), // Dynamically get sheetId
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex
            }
          }
        }]
      };

      await axios.post(url, requestBody, {
        headers: this.getAuthHeaders(accessToken),
        params: {}
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      // Optionally log more details from error.response
      throw error;
    }
  }

  /**
   * Batch update multiple cells
   */
  async batchUpdate(accessToken: string, updates: BatchUpdate[]): Promise<void> {
    try {
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}:batchUpdate`;
      const sheetId = await this.getSheetIdByName(accessToken, 'AllScholars'); // Dynamically get sheetId

      const requests = updates.map(update => ({
        updateCells: {
          range: {
            sheetId: sheetId,
            startRowIndex: update.rowIndex - 1,
            endRowIndex: update.rowIndex,
            startColumnIndex: update.columnIndex,
            endColumnIndex: update.columnIndex + 1
          },
          rows: [{
            values: [{
              userEnteredValue: {
                stringValue: update.value
              }
            }]
          }],
          fields: 'userEnteredValue'
        }
      }));

      await axios.post(url, { requests }, {
        headers: this.getAuthHeaders(accessToken),
        params: {
          key: this.apiKey // apiKey might be needed here depending on auth setup for batchUpdate specifically
        }
      });
    } catch (error) {
      console.error('Error batch updating:', error);
      // Consider more specific error type
      throw new Error('Failed to batch update Google Sheets');
    }
  }

  /**
   * Get sheet metadata
   */
  async getSheetMetadata(accessToken: string, sheetName: string = 'AllScholars'): Promise<SheetMetadata> { // Added sheetName param with default
    try {
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}?includeGridData=false`; // includeGridData=false if only properties needed
      
      const response = await axios.get(url, {
        headers: this.getAuthHeaders(accessToken),
        params: {
          key: this.apiKey,
          fields: 'properties.title,sheets(properties(sheetId,title,gridProperties(rowCount,columnCount)),data.rowData)' // Request specific fields
        }
      });

      const foundSheet = response.data.sheets.find((s: any) => s.properties.title === sheetName);

      if (!foundSheet) {
        throw new Error(`Sheet with name "${sheetName}" not found.`);
      }
      
      return {
        title: foundSheet.properties.title,
        sheetId: foundSheet.properties.sheetId,
        lastModified: new Date(response.data.properties.modifiedTime || Date.now()), // This is spreadsheet lastModified
        rowCount: foundSheet.properties.gridProperties.rowCount,
        columnCount: foundSheet.properties.gridProperties.columnCount
      };
    } catch (error) {
      console.error(`Error fetching metadata for sheet "${sheetName}":`, error);
      throw new Error(`Failed to fetch metadata for sheet "${sheetName}"`);
    }
  }

  private async getSheetIdByName(accessToken: string, sheetName: string): Promise<number> {
    const metadata = await this.getSheetMetadata(accessToken, sheetName);
    return metadata.sheetId;
  }

  // Placeholder for actual implementation if needed within this service
  private generateStudentIdInternal(): string {
    return `student_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Placeholder for actual implementation
  private getRowIndexFromResponse(responseData: any): number {
    // console.warn('getRowIndexFromResponse is not fully implemented.', responseData); // Removed console.warn
    if (responseData?.updates?.updatedRange) {
      const rangeString = responseData.updates.updatedRange;
      // Regex to find the first number after '!' and any letter (e.g., Sheet1!A101 -> 101)
      const match = rangeString.match(/![A-Z]+(\d+)/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    // Consider throwing an error or returning a more indicative value if parsing fails
    return -1; 
  }

  /**
   * Column management methods using the GoogleSheetsColumnService
   */

  /**
   * Add a new column to the Google Sheet
   */
  async addColumn(accessToken: string, columnName: string, insertAfterColumn?: number): Promise<void> {
    return this.columnService.addColumn(accessToken, columnName, insertAfterColumn);
  }

  /**
   * Rename a column in the Google Sheet
   */
  async renameColumn(accessToken: string, oldColumnName: string, newColumnName: string): Promise<void> {
    return this.columnService.renameColumn(accessToken, oldColumnName, newColumnName);
  }

  /**
   * Remove a column from the Google Sheet
   */
  async removeColumn(accessToken: string, columnName: string): Promise<void> {
    return this.columnService.removeColumn(accessToken, columnName);
  }

  /**
   * Get current sheet headers
   */
  async getSheetHeaders(accessToken: string): Promise<string[]> {
    return this.columnService.getSheetHeaders(accessToken);
  }

  /**
   * Sync column settings with Google Sheets structure
   */
  async syncColumnSettings(accessToken: string, columnSettings: any[]): Promise<any> {
    return this.columnService.syncColumnSettings(accessToken, columnSettings);
  }

  /**
   * Convert a number to column letter (A, B, C, ... Z, AA, AB, etc.)
   */
  private numberToColumnLetter(num: number): string {
    let columnLetter = '';
    while (num > 0) {
      num--; // Adjust for 0-based indexing
      columnLetter = String.fromCharCode(65 + (num % 26)) + columnLetter;
      num = Math.floor(num / 26);
    }
    return columnLetter;
  }

}

export const googleSheetsService = new GoogleSheetsService();
