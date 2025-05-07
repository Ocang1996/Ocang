import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with thousands separators
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

/**
 * Format a percentage with one decimal place
 */
export const formatPercent = (value: number): string => {
  return value.toFixed(1) + '%';
};

/**
 * Format a currency value
 */
export const formatCurrency = (value: number, currency: string = 'IDR'): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Short format for large numbers (K for thousands, M for millions)
 */
export const formatCompact = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value);
};

/**
 * Format a date to a string in the specified format
 */
export const formatDate = (date: Date, format: string = 'short'): string => {
  const options: Intl.DateTimeFormatOptions = 
    format === 'full' 
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : format === 'medium'
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : { day: 'numeric', month: 'numeric', year: 'numeric' };
  
  return new Intl.DateTimeFormat('id-ID', options).format(date);
};

/**
 * Generate random number between min and max
 */
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get Indonesian month name
 */
export function getMonthName(month: number): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];
  return months[month];
}

/**
 * Generate random hex color
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

/**
 * Create a color scale from start to end color
 */
export function createColorScale(startColor: string, endColor: string, steps: number): string[] {
  const scale: string[] = [];
  
  // Parse hex colors to RGB
  const start = {
    r: parseInt(startColor.slice(1, 3), 16),
    g: parseInt(startColor.slice(3, 5), 16),
    b: parseInt(startColor.slice(5, 7), 16)
  };
  
  const end = {
    r: parseInt(endColor.slice(1, 3), 16),
    g: parseInt(endColor.slice(3, 5), 16),
    b: parseInt(endColor.slice(5, 7), 16)
  };
  
  // Calculate step size for each RGB component
  const stepSize = {
    r: (end.r - start.r) / (steps - 1),
    g: (end.g - start.g) / (steps - 1),
    b: (end.b - start.b) / (steps - 1)
  };
  
  // Generate colors for each step
  for (let i = 0; i < steps; i++) {
    const r = Math.round(start.r + stepSize.r * i);
    const g = Math.round(start.g + stepSize.g * i);
    const b = Math.round(start.b + stepSize.b * i);
    
    // Convert RGB back to hex
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    scale.push(hex);
  }
  
  return scale;
}

/**
 * Get age from birth date
 */
export function getAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get remaining service years until retirement (usually 60 years in Indonesia)
 */
export function getRemainingServiceYears(birthDate: string, retirementAge: number = 60): number {
  const age = getAge(birthDate);
  return Math.max(0, retirementAge - age);
}

/**
 * Calculate predicted retirement year based on birth date
 */
export function getRetirementYear(birthDate: string, retirementAge: number = 60): number {
  const birth = new Date(birthDate);
  return birth.getFullYear() + retirementAge;
}

/**
 * Group employees by a specific property
 */
export function groupEmployees<T, K extends keyof T>(
  employees: T[],
  key: K
): Record<string, T[]> {
  return employees.reduce((acc, employee) => {
    const value = String(employee[key]);
    if (!acc[value]) {
      acc[value] = [];
    }
    acc[value].push(employee);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Generate chart colors based on data length
 */
export function generateChartColors(length: number): string[] {
  // Predefined color scales for better visuals
  const colorScales = [
    // Blue scale
    createColorScale('#0E4C92', '#5DA9E9', Math.min(length, 6)),
    // Green scale
    createColorScale('#1E5631', '#A4DE02', Math.min(length, 6)),
    // Purple scale
    createColorScale('#4A0D67', '#CDABF8', Math.min(length, 6)),
    // Orange scale
    createColorScale('#BB4D00', '#FFCF9D', Math.min(length, 6))
  ];
  
  // Select a color scale based on data type or just randomly
  const selectedScale = colorScales[Math.floor(Math.random() * colorScales.length)];
  
  // If we need more colors than in the scale, generate additional random ones
  if (length > selectedScale.length) {
    const additionalColors = Array(length - selectedScale.length)
      .fill(0)
      .map(() => randomColor());
    return [...selectedScale, ...additionalColors];
  }
  
  return selectedScale.slice(0, length);
} 