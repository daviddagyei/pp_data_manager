import type { ColumnSettings } from '../contexts/SettingsContext';

/**
 * Validate a custom field value based on its column settings
 */
export const validateCustomFieldValue = (
  value: any,
  columnSettings: ColumnSettings
): { isValid: boolean; error?: string } => {
  // Handle required fields
  if (columnSettings.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return {
      isValid: false,
      error: `${columnSettings.headerName} is required`
    };
  }

  // If value is empty and not required, it's valid
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: true };
  }

  // Type-specific validation
  switch (columnSettings.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return {
          isValid: false,
          error: `${columnSettings.headerName} must be a valid email address`
        };
      }
      break;

    case 'phone':
      // Allow various phone formats
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanedPhone = value.replace(/[\s\-\(\)\.]/g, '');
      if (!phoneRegex.test(cleanedPhone)) {
        return {
          isValid: false,
          error: `${columnSettings.headerName} must be a valid phone number`
        };
      }
      break;

    case 'number':
      if (isNaN(Number(value))) {
        return {
          isValid: false,
          error: `${columnSettings.headerName} must be a valid number`
        };
      }
      break;

    case 'date':
      if (isNaN(Date.parse(value))) {
        return {
          isValid: false,
          error: `${columnSettings.headerName} must be a valid date`
        };
      }
      break;

    case 'string':
      if (columnSettings.maxLength && value.length > columnSettings.maxLength) {
        return {
          isValid: false,
          error: `${columnSettings.headerName} must be ${columnSettings.maxLength} characters or less`
        };
      }
      break;
  }

  return { isValid: true };
};

/**
 * Validate all custom fields for a student
 */
export const validateAllCustomFields = (
  customFields: Record<string, any>,
  columnSettings: ColumnSettings[]
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Get custom column settings
  const customColumns = columnSettings.filter(col => col.isCustom);

  // Validate each custom field
  for (const column of customColumns) {
    const value = customFields[column.field];
    const validation = validateCustomFieldValue(value, column);
    
    if (!validation.isValid) {
      errors[column.field] = validation.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format custom field value for display
 */
export const formatCustomFieldValue = (
  value: any,
  type: ColumnSettings['type']
): string => {
  if (!value) return '-';

  switch (type) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'number':
      return value.toString();
    default:
      return String(value);
  }
};
