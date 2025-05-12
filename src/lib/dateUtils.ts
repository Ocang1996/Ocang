// Utility functions for date handling in the application

import { addDays, isWeekend, format } from 'date-fns';

// Daftar hari libur resmi Indonesia 2024-2025
// Format: 'YYYY-MM-DD' 
export const HOLIDAYS_2024_2025: string[] = [
  // 2024 - Hari Libur Nasional
  '2024-01-01', // Tahun Baru Masehi
  '2024-02-10', // Tahun Baru Imlek
  '2024-03-11', // Isra Miraj
  '2024-03-30', // Hari Raya Nyepi
  '2024-03-29', // Wafat Isa Almasih
  '2024-04-10', // Hari Raya Idul Fitri
  '2024-04-11', // Hari Raya Idul Fitri
  '2024-05-01', // Hari Buruh Internasional
  '2024-05-09', // Kenaikan Isa Almasih
  '2024-05-23', // Hari Raya Waisak
  '2024-06-01', // Hari Lahir Pancasila
  '2024-06-17', // Hari Raya Idul Adha
  '2024-07-07', // Tahun Baru Islam
  '2024-08-17', // Hari Kemerdekaan RI
  '2024-09-16', // Maulid Nabi Muhammad
  '2024-12-25', // Hari Raya Natal

  // 2025 - Hari Libur Nasional (perkiraan)
  '2025-01-01', // Tahun Baru Masehi
  '2025-01-29', // Tahun Baru Imlek
  '2025-03-28', // Isra Miraj
  '2025-03-19', // Hari Raya Nyepi
  '2025-04-18', // Wafat Isa Almasih
  '2025-03-31', // Hari Raya Idul Fitri
  '2025-04-01', // Hari Raya Idul Fitri
  '2025-05-01', // Hari Buruh Internasional
  '2025-05-29', // Kenaikan Isa Almasih
  '2025-05-12', // Hari Raya Waisak
  '2025-06-01', // Hari Lahir Pancasila
  '2025-06-06', // Hari Raya Idul Adha
  '2025-06-27', // Tahun Baru Islam
  '2025-08-17', // Hari Kemerdekaan RI
  '2025-09-04', // Maulid Nabi Muhammad
  '2025-12-25'  // Hari Raya Natal
];

// Cuti bersama (tambahkan sesuai pengumuman dari pemerintah)
export const COLLECTIVE_LEAVE_2024_2025: string[] = [
  // 2024
  '2024-04-08', // Cuti Bersama Idul Fitri
  '2024-04-09', // Cuti Bersama Idul Fitri
  '2024-04-12', // Cuti Bersama Idul Fitri
  '2024-12-24', // Cuti Bersama Natal
  '2024-12-26', // Cuti Bersama Natal
  
  // 2025 (perkiraan, sesuaikan ketika diumumkan)
  '2025-03-28', // Cuti Bersama Idul Fitri
  '2025-03-31', // Cuti Bersama Idul Fitri
  '2025-04-02', // Cuti Bersama Idul Fitri
  '2025-04-03', // Cuti Bersama Idul Fitri
  '2025-12-26', // Cuti Bersama Natal
];

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  return HOLIDAYS_2024_2025.includes(dateStr) || COLLECTIVE_LEAVE_2024_2025.includes(dateStr);
}

/**
 * Check if a date is a weekend or a holiday
 */
export function isNonWorkingDay(date: Date): boolean {
  return isWeekend(date) || isHoliday(date);
}

/**
 * Calculate the end date based on start date and duration in working days
 * Skips weekends and holidays
 */
export function calculateEndDateWithWorkingDays(startDate: Date, durationInDays: number): Date {
  if (durationInDays <= 0) return startDate;
  
  let currentDate = startDate;
  let workingDaysCount = 1; // Start date already counts as 1 working day
  
  // Skip calculation if duration is 1 (just the start date)
  if (durationInDays === 1) return startDate;
  
  // Continue adding days until we've counted enough working days
  while (workingDaysCount < durationInDays) {
    currentDate = addDays(currentDate, 1);
    
    // If the day is a working day, increment the counter
    if (!isNonWorkingDay(currentDate)) {
      workingDaysCount++;
    }
  }
  
  return currentDate;
}

/**
 * Get the names of upcoming holidays within a date range
 * For displaying to the user
 */
export function getHolidaysInRange(startDate: Date, endDate: Date): { date: string; isWeekend: boolean; isHoliday: boolean; isCollectiveLeave: boolean }[] {
  const holidays = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const isWeekendDay = isWeekend(currentDate);
    const isHolidayDay = HOLIDAYS_2024_2025.includes(dateStr);
    const isCollectiveLeaveDay = COLLECTIVE_LEAVE_2024_2025.includes(dateStr);
    
    if (isWeekendDay || isHolidayDay || isCollectiveLeaveDay) {
      holidays.push({
        date: dateStr,
        isWeekend: isWeekendDay,
        isHoliday: isHolidayDay,
        isCollectiveLeave: isCollectiveLeaveDay
      });
    }
    
    currentDate = addDays(currentDate, 1);
  }
  
  return holidays;
}
