export interface FarmEntry {
  id?: number; // Primary key from the Supabase database
  date: string;
  farm: string;
  // Allow any other string key with a value of number, string, or undefined.
  // This makes the type flexible for custom, user-defined fields.
  [key: string]: number | string | undefined;
}