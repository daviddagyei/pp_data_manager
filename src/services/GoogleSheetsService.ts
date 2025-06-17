import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { Student, GoogleSheetsResponse, SheetMetadata, BatchUpdate } from '../types';

class GoogleSheetsService {
  private readonly baseUrl = 'https://sheets.googleapis.com/v4';
  private readonly spreadsheetId: string;
  private readonly apiKey: string;
  
  constructor() {
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    
    if (!this.spreadsheetId || !this.apiKey) {
      throw new Error('Google Sheets configuration is missing. Please check your environment variables.');
    }
  }

  private getAuthHeaders(accessToken: string) {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Debug function to inspect access token
   */
  private debugAccessToken(accessToken: string) {
    try {
      // Decode the token without verification (for debugging only)
      const tokenParts = accessToken.split('.');
      if (tokenParts.length === 3) {
        // This is a JWT token
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('🔐 Token Debug Info:');
        console.log('- Audience (aud):', payload.aud);
        console.log('- Scopes:', payload.scope);
        console.log('- Expires at:', new Date(payload.exp * 1000));
        console.log('- Current time:', new Date());
        console.log('- Token valid:', payload.exp * 1000 > Date.now());
      } else {
        console.log('🔐 Access token format: Not a JWT (likely OAuth2 access token)');
        console.log('- Length:', accessToken.length);
      }
    } catch (error) {
      console.log('🔐 Could not decode token for inspection');
    }
  }

  /**
   * Fetch all student data from the Google Sheet
   */
  async fetchStudents(accessToken: string): Promise<Student[]> {
    try {
      // Debug logging
      console.log('🔍 Debug Info:');
      this.debugAccessToken(accessToken);
      console.log('Access Token (first 20 chars):', accessToken.substring(0, 20) + '...');
      console.log('Spreadsheet ID:', this.spreadsheetId);
      
      const range = 'Sheet1!A1:Q1000'; // Adjust range as needed
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}/values/${range}`;
      console.log('Request URL:', url);
      
      const headers = this.getAuthHeaders(accessToken);
      console.log('Request Headers:', headers);
      
      const response: AxiosResponse<GoogleSheetsResponse> = await axios.get(url, {
        headers,
        params: {
          key: this.apiKey
        }
      });

      console.log('✅ Request successful!');
      const { values } = response.data;
      
      if (!values || values.length === 0) {
        console.log('📝 No data found in sheet');
        return [];
      }

      console.log(`📊 Found ${values.length} rows (including header)`);
      
      // First row contains headers, skip it
      const [headers_row, ...rows] = values;
      console.log('Header row:', headers_row);
      
      return this.transformRowsToStudents(rows, headers_row);
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      
      // Enhanced error logging
      if (axios.isAxiosError(error)) {
        console.log('Response status:', error.response?.status);
        console.log('Response data:', error.response?.data);
        console.log('Request config:', {
          url: error.config?.url,
          headers: error.config?.headers,
          method: error.config?.method
        });
      }
      
      throw new Error('Failed to fetch student data from Google Sheets');
    }
  }

  /**
   * Add a new student to the Google Sheet
   */
  async addStudent(accessToken: string, student: Partial<Student>): Promise<Student> {
    try {
      const range = 'Sheet1'; // Append to the sheet
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}/values/${range}:append`;
      
      const rowData = this.transformStudentToRow(student);
      
      const response = await axios.post(url, {
        values: [rowData],
        majorDimension: 'ROWS'
      }, {
        headers: this.getAuthHeaders(accessToken),
        params: {
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          key: this.apiKey
        }
      });

      // Create a new student object with generated ID and metadata
      const newStudent: Student = {
        ...student as Student,
        id: this.generateStudentId(),
        rowIndex: this.getRowIndexFromResponse(response.data),
        lastModified: new Date()
      };

      return newStudent;
    } catch (error) {
      console.error('Error adding student:', error);
      throw new Error('Failed to add student to Google Sheets');
    }
  }

  /**
   * Update an existing student in the Google Sheet
   */
  async updateStudent(accessToken: string, rowIndex: number, student: Partial<Student>): Promise<Student> {
    try {
      const range = `Sheet1!A${rowIndex}:Q${rowIndex}`; // Update specific row
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}/values/${range}`;
      
      const rowData = this.transformStudentToRow(student);
      
      await axios.put(url, {
        values: [rowData],
        majorDimension: 'ROWS'
      }, {
        headers: this.getAuthHeaders(accessToken),
        params: {
          valueInputOption: 'USER_ENTERED',
          key: this.apiKey
        }
      });

      return {
        ...student as Student,
        rowIndex,
        lastModified: new Date()
      };
    } catch (error) {
      console.error('Error updating student:', error);
      throw new Error('Failed to update student in Google Sheets');
    }
  }

  /**
   * Delete a student from the Google Sheet
   */
  async deleteStudent(accessToken: string, rowIndex: number): Promise<void> {
    try {
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}:batchUpdate`;
      
      const request = {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Assuming first sheet
              dimension: 'ROWS',
              startIndex: rowIndex - 1, // Convert to 0-based index
              endIndex: rowIndex
            }
          }
        }]
      };

      await axios.post(url, request, {
        headers: this.getAuthHeaders(accessToken),
        params: {
          key: this.apiKey
        }
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      throw new Error('Failed to delete student from Google Sheets');
    }
  }

  /**
   * Batch update multiple cells
   */
  async batchUpdate(accessToken: string, updates: BatchUpdate[]): Promise<void> {
    try {
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}:batchUpdate`;
      
      const requests = updates.map(update => ({
        updateCells: {
          range: {
            sheetId: 0,
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
          key: this.apiKey
        }
      });
    } catch (error) {
      console.error('Error batch updating:', error);
      throw new Error('Failed to batch update Google Sheets');
    }
  }

  /**
   * Get sheet metadata
   */
  async getSheetMetadata(accessToken: string): Promise<SheetMetadata> {
    try {
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}`;
      
      const response = await axios.get(url, {
        headers: this.getAuthHeaders(accessToken),
        params: {
          key: this.apiKey
        }
      });

      const sheet = response.data.sheets[0];
      
      return {
        title: response.data.properties.title,
        sheetId: sheet.properties.sheetId,
        lastModified: new Date(response.data.properties.modifiedTime || Date.now()),
        rowCount: sheet.properties.gridProperties.rowCount,
        columnCount: sheet.properties.gridProperties.columnCount
      };
    } catch (error) {
      console.error('Error fetching sheet metadata:', error);
      throw new Error('Failed to fetch sheet metadata');
    }
  }

  /**
   * Transform Google Sheets rows to Student objects
   */
  private transformRowsToStudents(rows: string[][], headers: string[]): Student[] {
    return rows.map((row, index) => {
      const student: Partial<Student> = {};
      
      // Map each cell to the corresponding field
      headers.forEach((header, colIndex) => {
        const value = row[colIndex] || '';
        
        switch (header.toLowerCase().replace(/\s+/g, '')) {
          case 'lastname':
            student.lastName = value;
            break;
          case 'firstname':
            student.firstName = value;
            break;
          case 'email':
            student.email = value;
            break;
          case 'cellnumber':
          case 'cellnumber(xxx-xxx-xxxx)':
            student.cellNumber = value;
            break;
          case 'parent\'sname':
          case 'parentsname':
            student.parentName = value;
            break;
          case 'parent\'scell':
          case 'parentscell':
            student.parentCell = value;
            break;
          case 'parent\'semail':
          case 'parentsemail':
            student.parentEmail = value;
            break;
          case 'highschool':
            student.highSchool = value;
            break;
          case 'graduationyear':
            student.graduationYear = parseInt(value) || new Date().getFullYear();
            break;
          case 'dob':
            student.dob = value ? new Date(value) : new Date();
            break;
          case 'parentform':
            student.parentForm = value.toLowerCase() === 'x' || value.toLowerCase() === 'true';
            break;
          case 'careerexploration':
            student.careerExploration = value && value !== '' ? new Date(value) : undefined;
            break;
          case 'collegeexploration':
            student.collegeExploration = value && value !== '' ? new Date(value) : undefined;
            break;
          case 'collegeenrolledfall2025':
            student.collegeEnrolled = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
            break;
          case 'participationpoints':
            student.participationPoints = parseInt(value) || 0;
            break;
          case 'spreadsheetsubmitted':
            student.spreadsheetSubmitted = value;
            break;
          case 'places':
            student.places = parseInt(value) || 0;
            break;
        }
      });

      return {
        ...student,
        id: this.generateStudentId(index),
        rowIndex: index + 2, // +2 because sheets are 1-indexed and first row is headers
        lastModified: new Date()
      } as Student;
    });
  }

  /**
   * Transform Student object to Google Sheets row format
   */
  private transformStudentToRow(student: Partial<Student>): string[] {
    return [
      student.lastName || '',
      student.firstName || '',
      student.email || '',
      student.cellNumber || '',
      student.parentName || '',
      student.parentCell || '',
      student.parentEmail || '',
      student.highSchool || '',
      student.graduationYear?.toString() || '',
      student.dob ? student.dob.toLocaleDateString() : '',
      student.parentForm ? 'x' : '',
      student.careerExploration ? student.careerExploration.toLocaleDateString() : '',
      student.collegeExploration ? student.collegeExploration.toLocaleDateString() : '',
      student.collegeEnrolled ? 'Yes' : '',
      student.participationPoints?.toString() || '',
      student.spreadsheetSubmitted || '',
      student.places?.toString() || ''
    ];
  }

  /**
   * Generate a unique student ID
   */
  private generateStudentId(index?: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `student_${timestamp}_${index || random}`;
  }

  /**
   * Extract row index from API response
   */
  private getRowIndexFromResponse(response: any): number {
    // Parse the range from response to get the row number
    const range = response.updatedRange || '';
    const match = range.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Test basic API access with minimal permissions
   */
  async testAPIAccess(accessToken: string): Promise<boolean> {
    try {
      console.log('🧪 Testing basic API access...');
      console.log('🔍 Token being used:', accessToken.substring(0, 30) + '...');
      console.log('🔍 Token length:', accessToken.length);
      console.log('🔍 Token type:', accessToken.startsWith('ya29') ? 'OAuth2 access token' : 'Unknown format');
      
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}`;
      console.log('🔗 Request URL:', url);
      
      const response = await axios.get(url, {
        headers: this.getAuthHeaders(accessToken),
        params: {
          fields: 'properties.title', // Request only basic info
          key: this.apiKey
        }
      });
      
      console.log('✅ Basic API test successful!');
      console.log('Sheet title:', response.data.properties?.title);
      return true;
    } catch (error) {
      console.error('❌ Basic API test failed:', error);
      if (axios.isAxiosError(error)) {
        console.log('Status:', error.response?.status);
        console.log('Error details:', error.response?.data);
        
        // Provide specific guidance based on error type
        if (error.response?.status === 401) {
          console.log('🚨 401 Unauthorized - Token appears to be invalid/expired');
          this.debugAccessToken(accessToken);
        } else if (error.response?.status === 403) {
          const errorData = error.response.data;
          if (errorData?.error?.message?.includes('Sheets API has not been used')) {
            console.log('🚨 403 Forbidden - Google Sheets API is not enabled in your project');
            console.log('👉 Enable it at: https://console.cloud.google.com/apis/library/sheets.googleapis.com');
          } else if (errorData?.error?.message?.includes('does not have access')) {
            console.log('🚨 403 Forbidden - No access to this spreadsheet');
            console.log('👉 Make sure the spreadsheet is shared or public');
          } else {
            console.log('🚨 403 Forbidden - Permission denied');
            console.log('👉 Check API permissions and spreadsheet access');
          }
        } else if (error.response?.status === 404) {
          console.log('🚨 404 Not Found - Spreadsheet ID might be incorrect');
          console.log('👉 Verify spreadsheet ID:', this.spreadsheetId);
        }
      }
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
