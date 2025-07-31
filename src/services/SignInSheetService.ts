import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { SignInRow } from '../types/signIn';

export class SignInSheetService {
  private readonly baseUrl = 'https://sheets.googleapis.com/v4';
  private readonly spreadsheetId: string;
  private readonly apiKey: string;

  constructor() {
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!this.spreadsheetId || !this.apiKey) {
      throw new Error('Google Sheets configuration missing.');
    }
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
      const [, ...rows] = values; // skip header row
      return rows.map(row => {
        const firstName = row[0] || '';
        const lastName = row[1] || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        return {
          firstName,
          lastName,
          name: fullName, // computed field for backward compatibility
          school: row[2] || '',
          phone: row[3] || '',
          gradYear: row[4] || '',
          email: row[5] || '',
          date: row[6] || '',
          event: row[7] || '',
        };
      });
    } catch (error) {
      console.error('Error fetching sign-in sheet:', error);
      throw error;
    }
  }
}

export const signInSheetService = new SignInSheetService();
