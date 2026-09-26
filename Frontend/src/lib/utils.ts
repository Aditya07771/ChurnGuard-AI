import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a probability (0–1) as a percentage string */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

/** Format currency (monthly charges) */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format large numbers with comma separators */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

/** Format ISO date string to readable local date/time */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

/** Format ISO date only */
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

/** Truncate string with ellipsis */
export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
}

/** Get risk category color classes */
export function getRiskClasses(category: string | null | undefined): {
  text: string;
  bg: string;
  border: string;
  badge: string;
} {
  switch (category) {
    case "High":
      return {
        text: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-200",
        badge: "risk-high",
      };
    case "Medium":
      return {
        text: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        badge: "risk-medium",
      };
    case "Low":
      return {
        text: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-200",
        badge: "risk-low",
      };
    default:
      return {
        text: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-200",
        badge: "",
      };
  }
}

/** Get error message from an unknown error */
export function getErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

/** Debounce a value */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Convert a signed probability difference to a readable string */
export function formatProbabilityDiff(diff: number | null | undefined): string {
  if (diff === null || diff === undefined) return "—";
  const pct = (diff * 100).toFixed(1);
  return diff > 0 ? `+${pct}pp` : `${pct}pp`;
}

/** Clamp a number to a range */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Format a tenure value (months) */
export function formatTenure(months: number | null | undefined): string {
  if (months === null || months === undefined) return "—";
  if (months === 0) return "< 1 mo";
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (remaining === 0) return years === 1 ? "1 year" : `${years} years`;
  return `${years}y ${remaining}m`;
}

/** File size to human readable */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
