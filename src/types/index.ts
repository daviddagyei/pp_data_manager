export interface Student {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  cellNumber?: string;
  parentName?: string;
  parentCell?: string;
  parentEmail?: string;
  highSchool: string;
  graduationYear: number;
  dob: Date;
  parentForm: boolean;
  careerExploration?: Date;
  collegeExploration?: Date;
  collegeEnrolled?: boolean;
  participationPoints?: number;
  spreadsheetSubmitted?: string;
  places?: number;
  rowIndex: number; // For API updates
  lastModified: Date; // For conflict detection
  customFields: Record<string, any>; // Dynamic custom fields
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
  tokenExpiry: Date;
}

// Google OAuth types
declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export interface DataState {
  students: Student[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  filteredStudents: Student[];
  searchQuery: string;
  filters: FilterOptions;
  sorting?: SortOption;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface SheetMetadata {
  title: string;
  sheetId: number;
  lastModified: Date;
  rowCount: number;
  columnCount: number;
}

export interface BatchUpdate {
  rowIndex: number;
  columnIndex: number;
  value: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface GoogleSheetsResponse {
  range: string;
  majorDimension: string;
  values: string[][];
}

export interface GoogleAuthResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export type StudentField = keyof Omit<Student, 'id' | 'rowIndex' | 'lastModified'>;

export interface FilterOptions {
  graduationYear?: number;
  highSchool?: string;
  parentFormCompleted?: boolean;
  careerExplorationCompleted?: boolean;
  collegeExplorationCompleted?: boolean;
}

export interface SortOption {
  field: StudentField;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  total: number;
}
