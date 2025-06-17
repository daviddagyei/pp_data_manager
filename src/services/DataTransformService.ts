import type { Student, ValidationResult } from '../types';

/**
 * Service for transforming and validating student data
 */
export class DataTransformService {
  /**
   * Convert raw Google Sheets data to Student objects
   */
  static transformSheetsDataToStudents(rawData: string[][]): Student[] {
    if (!rawData || rawData.length === 0) {
      return [];
    }

    const [headers, ...rows] = rawData;
    
    return rows.map((row, index) => this.transformRowToStudent(row, headers, index));
  }

  /**
   * Convert a single row to Student object
   */
  private static transformRowToStudent(row: string[], headers: string[], index: number): Student {
    const student: Partial<Student> = {};
    
    headers.forEach((header, colIndex) => {
      const value = row[colIndex] || '';
      const normalizedHeader = this.normalizeHeader(header);
      
      switch (normalizedHeader) {
        case 'lastname':
          student.lastName = value.trim();
          break;
        case 'firstname':
          student.firstName = value.trim();
          break;
        case 'email':
          student.email = value.trim().toLowerCase();
          break;
        case 'cellnumber':
        case 'cellnumberxxxxx':
          student.cellNumber = this.formatPhoneNumber(value);
          break;
        case 'parentsname':
          student.parentName = value.trim();
          break;
        case 'parentscell':
          student.parentCell = this.formatPhoneNumber(value);
          break;
        case 'parentsemail':
          student.parentEmail = value.trim().toLowerCase();
          break;
        case 'highschool':
          student.highSchool = value.trim();
          break;
        case 'graduationyear':
          student.graduationYear = this.parseYear(value);
          break;
        case 'dob':
          student.dob = this.parseDate(value);
          break;
        case 'parentform':
          student.parentForm = this.parseBoolean(value);
          break;
        case 'careerexploration':
          student.careerExploration = this.parseOptionalDate(value);
          break;
        case 'collegeexploration':
          student.collegeExploration = this.parseOptionalDate(value);
          break;
        case 'collegeenrolledfall2025':
        case 'collegeenrolled':
          student.collegeEnrolled = this.parseBoolean(value);
          break;
        case 'participationpoints':
          student.participationPoints = this.parseNumber(value);
          break;
        case 'spreadsheetsubmitted':
          student.spreadsheetSubmitted = value.trim() || undefined;
          break;
        case 'places':
          student.places = this.parseNumber(value);
          break;
      }
    });

    return {
      ...student,
      id: this.generateStudentId(index),
      rowIndex: index + 2, // +2 because sheets are 1-indexed and first row is headers
      lastModified: new Date()
    } as Student;
  }

  /**
   * Convert Student object to Google Sheets row format
   */
  static transformStudentToSheetsRow(student: Student): string[] {
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
      student.dob ? this.formatDateForSheets(student.dob) : '',
      student.parentForm ? 'x' : '',
      student.careerExploration ? this.formatDateForSheets(student.careerExploration) : '',
      student.collegeExploration ? this.formatDateForSheets(student.collegeExploration) : '',
      student.collegeEnrolled ? 'Yes' : '',
      student.participationPoints?.toString() || '',
      student.spreadsheetSubmitted || '',
      student.places?.toString() || ''
    ];
  }

  /**
   * Normalize header names for consistent matching
   */
  private static normalizeHeader(header: string): string {
    return header
      .toLowerCase()
      .replace(/[^\w]/g, '') // Remove non-word characters
      .replace(/\s+/g, ''); // Remove spaces
  }

  /**
   * Format phone number to consistent format
   */
  private static formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format as XXX-XXX-XXXX if 10 digits
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    return phone; // Return original if not 10 digits
  }

  /**
   * Parse year from string
   */
  private static parseYear(yearStr: string): number {
    const year = parseInt(yearStr);
    const currentYear = new Date().getFullYear();
    
    // Validate year is reasonable (between 1950 and current year + 10)
    if (year >= 1950 && year <= currentYear + 10) {
      return year;
    }
    
    return currentYear; // Default to current year
  }

  /**
   * Parse date from various formats
   */
  private static parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    
    // Try parsing common date formats
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      // If parsing fails, try other formats
      const formats = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
        /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
      ];
      
      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          const [, part1, part2, part3] = match;
          // Assume first format is MM/DD/YYYY, second is YYYY-MM-DD
          if (format === formats[0]) {
            return new Date(parseInt(part3), parseInt(part1) - 1, parseInt(part2));
          } else {
            return new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3));
          }
        }
      }
      
      return new Date(); // Default to current date if all parsing fails
    }
    
    return date;
  }

  /**
   * Parse optional date (can be empty)
   */
  private static parseOptionalDate(dateStr: string): Date | undefined {
    if (!dateStr || dateStr.trim() === '') return undefined;
    return this.parseDate(dateStr);
  }

  /**
   * Parse boolean from various string representations
   */
  private static parseBoolean(value: string): boolean {
    const lowerValue = value.toLowerCase().trim();
    return lowerValue === 'x' || 
           lowerValue === 'true' || 
           lowerValue === 'yes' || 
           lowerValue === '1';
  }

  /**
   * Parse number from string
   */
  private static parseNumber(numStr: string): number {
    const num = parseInt(numStr);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Format date for Google Sheets
   */
  private static formatDateForSheets(date: Date): string {
    return date.toLocaleDateString('en-US'); // MM/DD/YYYY format
  }

  /**
   * Generate unique student ID
   */
  private static generateStudentId(index: number): string {
    const timestamp = Date.now();
    return `student_${timestamp}_${index}`;
  }

  /**
   * Validate student data
   */
  static validateStudent(student: Partial<Student>): ValidationResult {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!student.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!student.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!student.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(student.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!student.highSchool?.trim()) {
      errors.highSchool = 'High school is required';
    }

    if (!student.graduationYear) {
      errors.graduationYear = 'Graduation year is required';
    } else if (student.graduationYear < 2020 || student.graduationYear > 2030) {
      errors.graduationYear = 'Please enter a valid graduation year';
    }

    if (!student.dob || isNaN(student.dob.getTime())) {
      errors.dob = 'Date of birth is required';
    }

    // Optional field validation
    if (student.cellNumber && !this.isValidPhoneNumber(student.cellNumber)) {
      errors.cellNumber = 'Please enter a valid phone number';
    }

    if (student.parentCell && !this.isValidPhoneNumber(student.parentCell)) {
      errors.parentCell = 'Please enter a valid parent phone number';
    }

    if (student.parentEmail && !this.isValidEmail(student.parentEmail)) {
      errors.parentEmail = 'Please enter a valid parent email address';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  private static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$|^\d{10}$|^\(\d{3}\)\s?\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Sanitize phone number for consistent storage
   */
  static sanitizePhoneNumber(phone: string): string {
    return this.formatPhoneNumber(phone);
  }
}
