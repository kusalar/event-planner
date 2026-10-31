import { CurrencyCode } from '@/types';

// Pre-warmed Intl formatters for maximum rendering performance
const formattersCache = new Map<string, Intl.NumberFormat>();

function getNumberFormatter(currency: CurrencyCode): Intl.NumberFormat {
  if (formattersCache.has(currency)) {
    return formattersCache.get(currency)!;
  }

  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

  formattersCache.set(currency, formatter);
  return formatter;
}

/**
 * Format a numeric amount into a currency string with appropriate locale symbols.
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  try {
    const formatter = getNumberFormatter(currency);
    return formatter.format(amount);
  } catch {
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
    return `${symbol}${amount.toLocaleString()}`;
  }
}

/**
 * Calculate the number of calendar days remaining until an event date string (YYYY-MM-DD).
 */
export function calculateDaysRemaining(dateStr: string): number {
  if (!dateStr) return 0;
  try {
    const eventDate = new Date(dateStr);
    if (isNaN(eventDate.getTime())) return 0;

    const now = new Date();
    // Reset time components to compare calendar days accurately
    const targetDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = targetDate.getTime() - currentDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

/**
 * Format date string into readable display format (e.g., "Feb 14, 2027").
 */
export function formatDateDisplay(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', options);
  } catch {
    return dateStr;
  }
}

