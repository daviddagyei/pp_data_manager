import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { SignInRow } from '../types/signIn';
import { SignInSheetColumnService } from './SignInSheetColumnService';
import { SignInDataTransformService } from './SignInDataTransformService';

export class SignInSheetService {
  private readonly baseUrl = 'https://sheets.googleapis.com/v4';
  private readonly spreadsheetId: string;
  private readonly apiKey: string;
  private columnService: SignInSheetColumnService;

  constructor() {
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!this.spreadsheetId || !this.apiKey) {
      throw new Error('Google Sheets configuration missing.');
    }
    this.columnService = new SignInSheetColumnService();
  }

  private getAuthHeaders(accessToken: string) {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async fetchSignIns(accessToken: string): Promise<SignInRow[]> {
    try {
      const range = "'sign-ins'!A1:H1000"; // Updated to include all 8 columns
      const url = `${this.baseUrl}/spreadsheets/${this.spreadsheetId}/values/${range}`;
      const response: AxiosResponse<{ values: string[][] }> = await axios.get(url, {
        headers: this.getAuthHeaders(accessToken),
        params: { key: this.apiKey }
      });
      const { values } = response.data;
      if (!values || values.length < 2) return [];
      
      // Transform the raw data to SignInRow objects with custom field support
      return SignInDataTransformService.transformSheetsDataToSignIns(values);
    } catch (error) {
      console.error('Error fetching sign-in sheet:', error);
      throw error;
    }
  }

  // Column management methods using the column service
  async addColumn(accessToken: string, columnName: string, insertAfterColumn?: number): Promise<void> {
    return this.columnService.addColumn(accessToken, columnName, insertAfterColumn);
  }

  async renameColumn(accessToken: string, oldColumnName: string, newColumnName: string): Promise<void> {
    return this.columnService.renameColumn(accessToken, oldColumnName, newColumnName);
  }

  async removeColumn(accessToken: string, columnName: string): Promise<void> {
    return this.columnService.removeColumn(accessToken, columnName);
  }

  async syncColumnSettings(accessToken: string, columnSettings: any[]): Promise<any> {
    return this.columnService.syncColumnSettings(accessToken, columnSettings);
  }

  async getSheetHeaders(accessToken: string): Promise<string[]> {
    return this.columnService.getSheetHeaders(accessToken);
  }
}

export const signInSheetService = new SignInSheetService();
