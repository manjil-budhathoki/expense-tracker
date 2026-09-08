import mockData from '../data/mockData.json';

export const NEPALI_MONTHS = mockData.nepaliMonths;

export const NEPALI_DAYS = mockData.nepaliDays;

/**
 * Returns current live English and approximate Bikram Sambat (BS) Date
 */
export function getDualCalendarInfo(date = new Date()) {
  // English Details
  const englishDateString = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Bikram Sambat (BS is ~56 years, 8 months ahead)
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth(); // 0-11
  const currentDay = date.getDate();

  // Offset logic for standard BS year & month approximation
  let bsYear = currentYear + 57;
  let bsMonthIndex = (currentMonth + 8) % 12;
  if (currentMonth < 3 || (currentMonth === 3 && currentDay < 14)) {
    bsYear = currentYear + 56;
  }

  const nepaliMonthName = NEPALI_MONTHS[bsMonthIndex].bs;
  const nepaliDayName = NEPALI_DAYS[date.getDay()];

  return {
    englishDateString,
    nepaliDateString: `${nepaliDayName}, ${nepaliMonthName} ${currentDay}, ${bsYear} BS`,
    bsYear,
  };
}