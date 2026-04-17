import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely format a date string with fallback for invalid dates
 * @param dateString - The date string to format
 * @param formatString - The format string for date-fns
 * @param fallback - Fallback text when date is invalid (default: 'Invalid Date')
 * @returns Formatted date string or fallback
 */
/**
 * Try to derive a Date from a Mongo ObjectId hex string
 */
function dateFromObjectIdHex(objectId: string): Date | null {
  if (!/^[0-9a-fA-F]{24}$/.test(objectId)) return null;
  try {
    const timestampHex = objectId.substring(0, 8);
    const seconds = parseInt(timestampHex, 16);
    if (Number.isNaN(seconds)) return null;
    return new Date(seconds * 1000);
  } catch {
    return null;
  }
}

/**
 * Safely format a date-like value with fallback for invalid dates
 * Accepts Date, ISO string, epoch ms, or a Mongo ObjectId string
 */
export function safeFormatDate(
  dateInput: unknown,
  formatString: string = 'MMM dd, yyyy',
  fallback: string = 'Invalid Date'
): string {
  if (!dateInput) return fallback;

  let date: Date | null = null;

  try {
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else if (typeof dateInput === 'string') {
      // If this looks like an ObjectId, derive from it
      const maybeFromId = dateFromObjectIdHex(dateInput);
      date = maybeFromId ?? new Date(dateInput);
    } else if (typeof dateInput === 'object') {
      // Some APIs might send { $date: ... } or other wrappers; try valueOf
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyVal: any = dateInput;
      if (anyVal && typeof anyVal.$date !== 'undefined') {
        date = new Date(anyVal.$date);
      } else if (typeof anyVal.valueOf === 'function') {
        const v = anyVal.valueOf();
        date = v instanceof Date ? v : new Date(v);
      }
    }

    if (!date || isNaN(date.getTime())) return fallback;
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error, 'Value:', dateInput);
    return fallback;
  }
}
