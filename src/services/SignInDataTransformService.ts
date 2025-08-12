import type { SignInRow } from '../types/signIn';

/**
 * Service for transforming and validating sign-in data
 */
export class SignInDataTransformService {
  /**
   * Convert raw Google Sheets data to SignInRow objects
   */
  static transformSheetsDataToSignIns(rawData: string[][]): SignInRow[] {
    if (!rawData || rawData.length === 0) {
      return [];
    }

    const [headers, ...rows] = rawData;
    
    return rows.map((row, index) => this.transformRowToSignIn(row, headers, index));
  }

  /**
   * Convert a single row to SignInRow object
   */
  private static transformRowToSignIn(row: string[], headers: string[], _index: number): SignInRow {
    const signIn: Partial<SignInRow> = {};
    
    headers.forEach((header, colIndex) => {
      const value = row[colIndex] || '';
      const normalizedHeader = this.normalizeHeader(header);
      
      switch (normalizedHeader) {
        case 'firstname':
          signIn.firstName = value.trim();
          break;
        case 'lastname':
          signIn.lastName = value.trim();
          break;
        case 'school':
          signIn.school = value.trim();
          break;
        case 'phone':
        case 'phonenumber':
        case 'cellnumber':
        case 'cell':
        case 'mobile':
        case 'mobilenumber':
          signIn.phone = this.formatPhoneNumber(value);
          break;
        case 'gradyear':
        case 'graduationyear':
          signIn.gradYear = value.trim();
          break;
        case 'email':
          signIn.email = value.trim().toLowerCase();
          break;
        case 'date':
          signIn.date = value.trim();
          break;
        case 'event':
          signIn.event = value.trim();
          break;
        default:
          // Handle custom fields - any unknown column becomes a custom field
          if (value.trim()) {
            if (!signIn.customFields) {
              signIn.customFields = {};
            }
            // Store custom field using generated field name for consistency with writing
            const fieldName = this.generateFieldName(header);
            signIn.customFields[fieldName] = value.trim();
          }
          break;
      }
    });

    // Compute the name field for backward compatibility
    const fullName = `${signIn.firstName || ''} ${signIn.lastName || ''}`.trim();

    return {
      ...signIn,
      name: fullName,
      customFields: signIn.customFields || {}
    } as SignInRow;
  }

  /**
   * Transform sign-in to sheets row based on dynamic headers
   */
  static transformSignInToSheetsRowDynamic(signIn: SignInRow, headers: string[]): string[] {
    return headers.map(header => {
      const normalizedHeader = this.normalizeHeader(header);
      
      // Handle standard fields
      switch (normalizedHeader) {
        case 'firstname':
          return signIn.firstName || '';
        case 'lastname':
          return signIn.lastName || '';
        case 'school':
          return signIn.school || '';
        case 'phone':
        case 'phonenumber':
        case 'cellnumber':
        case 'cell':
        case 'mobile':
        case 'mobilenumber':
          return signIn.phone || '';
        case 'gradyear':
        case 'graduationyear':
          return signIn.gradYear || '';
        case 'email':
          return signIn.email || '';
        case 'date':
          return signIn.date || '';
        case 'event':
          return signIn.event || '';
        default:
          // Handle custom fields
          const fieldName = this.generateFieldName(header);
          return signIn.customFields?.[fieldName] || '';
      }
    });
  }

  /**
   * Normalize header name for comparison
   */
  private static normalizeHeader(header: string): string {
    return header.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Generate consistent field name from header
   */
  private static generateFieldName(header: string): string {
    return header
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Format phone number for consistent storage
   */
  private static formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle different phone number formats
    if (cleaned.length === 10) {
      // US phone number: (XXX) XXX-XXXX
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US phone number with country code: +1 (XXX) XXX-XXXX
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    // Return original if format doesn't match expected patterns
    return phone;
  }

  /**
   * Detect custom columns from Sign-In Google Sheets headers that don't match known fields
   */
  static detectCustomColumns(headers: string[]): Array<{id: string, headerName: string, field: string}> {
    const knownHeaders = new Set([
      'firstname', 'lastname', 'school', 'phone', 'phonenumber', 'cellnumber',
      'cell', 'mobile', 'mobilenumber', 'gradyear', 'graduationyear', 'email', 'date', 'event'
    ]);

    const customColumns: Array<{id: string, headerName: string, field: string}> = [];
    const seenFields = new Set<string>(); // Track field names to prevent duplicates

    headers.forEach((header) => {
      const normalizedHeader = this.normalizeHeader(header);
      if (!knownHeaders.has(normalizedHeader) && header.trim()) {
        const fieldName = this.generateFieldName(header);
        
        // Ensure unique field names to prevent React key conflicts
        let uniqueFieldName = fieldName;
        let counter = 1;
        while (seenFields.has(uniqueFieldName)) {
          uniqueFieldName = `${fieldName}_${counter}`;
          counter++;
        }
        seenFields.add(uniqueFieldName);
        
        customColumns.push({
          id: `signin_custom_${uniqueFieldName}`,
          headerName: header.trim(),
          field: uniqueFieldName
        });
        
        console.log(`🔧 Created sign-in custom column: "${header}" -> field: "${uniqueFieldName}", id: "signin_custom_${uniqueFieldName}"`);
      }
    });

    return customColumns;
  }
}
