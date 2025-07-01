import type { Student } from '../types';

// Extend Window interface for Google API
declare global {
  interface Window {
    gapi?: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: any) => Promise<void>;
        setToken: (token: { access_token: string }) => void;
        sheets: {
          spreadsheets: {
            create: (params: any) => Promise<any>;
            values: {
              update: (params: any) => Promise<any>;
            };
            batchUpdate: (params: any) => Promise<any>;
          };
        };
      };
    };
  }
}

export class GoogleSheetsExportService {
  private static readonly DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

  /**
   * Initialize the Google Sheets API for export functionality
   */
  static async initializeExportAPI(accessToken: string): Promise<boolean> {
    try {
      // Check if gapi is available
      if (typeof window === 'undefined' || !window.gapi) {
        console.error('Google API library not loaded');
        return false;
      }

      const gapi = window.gapi;

      // Initialize gapi client if not already done
      if (!gapi.client) {
        return new Promise((resolve) => {
          gapi.load('client', async () => {
            try {
              await gapi.client.init({
                apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
                discoveryDocs: [this.DISCOVERY_DOC],
              });
              
              // Set the access token
              gapi.client.setToken({ access_token: accessToken });
              resolve(true);
            } catch (error) {
              console.error('Failed to initialize gapi client:', error);
              resolve(false);
            }
          });
        });
      }

      // Set the access token
      gapi.client.setToken({ access_token: accessToken });
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets API for export:', error);
      return false;
    }
  }

  /**
   * Create a new Google Sheet with the filtered student data
   */
  static async exportFilteredStudents(
    students: Student[],
    accessToken: string,
    sheetTitle: string = 'Filtered Students Export'
  ): Promise<{ success: boolean; sheetUrl?: string; error?: string }> {
    try {
      // Initialize the API
      const initialized = await this.initializeExportAPI(accessToken);
      if (!initialized) {
        return { success: false, error: 'Failed to initialize Google Sheets API' };
      }

      // Ensure gapi is available after initialization
      if (!window.gapi?.client?.sheets) {
        return { success: false, error: 'Google Sheets API not available' };
      }

      // Create a new spreadsheet
      const createRequest = {
        properties: {
          title: `${sheetTitle} - ${new Date().toLocaleDateString()}`
        },
        sheets: [{
          properties: {
            title: 'Filtered Students'
          }
        }]
      };

      const createResponse = await window.gapi.client.sheets.spreadsheets.create({
        resource: createRequest
      });

      const spreadsheetId = createResponse.result.spreadsheetId;
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

      // Prepare the data for export
      const exportData = this.prepareDataForExport(students);

      // Add data to the sheet
      const updateRequest = {
        spreadsheetId: spreadsheetId,
        range: 'Filtered Students!A1',
        valueInputOption: 'RAW',
        resource: {
          values: exportData
        }
      };

      await window.gapi.client.sheets.spreadsheets.values.update(updateRequest);

      // Format the header row
      await this.formatHeaderRow(spreadsheetId);

      // Auto-resize columns
      await this.autoResizeColumns(spreadsheetId, 0); // 0 is the sheet ID for the first sheet

      return { 
        success: true, 
        sheetUrl: sheetUrl
      };

    } catch (error) {
      console.error('Error exporting to Google Sheets:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Prepare student data for export to Google Sheets
   */
  private static prepareDataForExport(students: Student[]): string[][] {
    // Header row
    const headers = [
      'ID',
      'First Name', 
      'Last Name',
      'Email',
      'Cell Number',
      'Parent Name',
      'Parent Cell',
      'Parent Email',
      'High School',
      'Graduation Year',
      'Date of Birth',
      'Parent Form',
      'Career Exploration',
      'College Exploration',
      'College Enrolled',
      'Participation Points',
      'Spreadsheet Submitted',
      'Places',
      'Last Modified'
    ];

    // Data rows
    const rows = students.map(student => [
      student.id || '',
      student.firstName || '',
      student.lastName || '',
      student.email || '',
      student.cellNumber || '',
      student.parentName || '',
      student.parentCell || '',
      student.parentEmail || '',
      student.highSchool || '',
      student.graduationYear?.toString() || '',
      student.dob ? new Date(student.dob).toLocaleDateString() : '',
      student.parentForm ? 'Yes' : 'No',
      student.careerExploration ? new Date(student.careerExploration).toLocaleDateString() : '',
      student.collegeExploration ? new Date(student.collegeExploration).toLocaleDateString() : '',
      student.collegeEnrolled ? 'Yes' : 'No',
      student.participationPoints?.toString() || '',
      student.spreadsheetSubmitted || '',
      student.places?.toString() || '',
      student.lastModified ? new Date(student.lastModified).toLocaleDateString() : ''
    ]);

    return [headers, ...rows];
  }

  /**
   * Format the header row with bold styling and background color
   */
  private static async formatHeaderRow(spreadsheetId: string): Promise<void> {
    try {
      if (!window.gapi?.client?.sheets) {
        throw new Error('Google API client not initialized');
      }

      const requests = [{
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1
          },
          cell: {
            userEnteredFormat: {
              textFormat: {
                bold: true
              },
              backgroundColor: {
                red: 0.9,
                green: 0.9,
                blue: 0.9
              }
            }
          },
          fields: 'userEnteredFormat(textFormat,backgroundColor)'
        }
      }];

      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: { requests }
      });
    } catch (error) {
      console.error('Error formatting header row:', error);
    }
  }

  /**
   * Auto-resize columns to fit content
   */
  private static async autoResizeColumns(spreadsheetId: string, sheetId: number): Promise<void> {
    try {
      if (!window.gapi?.client?.sheets) {
        throw new Error('Google API client not initialized');
      }

      const requests = [{
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 19 // Adjust based on number of columns
          }
        }
      }];

      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: { requests }
      });
    } catch (error) {
      console.error('Error auto-resizing columns:', error);
    }
  }

  /**
   * Export filtered data as CSV (fallback option)
   */
  static exportAsCSV(students: Student[], filename: string = 'filtered_students.csv'): void {
    try {
      const data = this.prepareDataForExport(students);
      const csvContent = data.map(row => 
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting as CSV:', error);
    }
  }
}
