export interface SignInRow {
  firstName: string;
  lastName: string;
  name: string; // computed field for backward compatibility
  school: string;
  phone: string;
  gradYear: string;
  email: string;
  date: string;
  event: string;
  customFields?: Record<string, any>; // Support for custom fields
}
