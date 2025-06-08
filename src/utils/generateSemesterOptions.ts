import { getItem } from 'expo-secure-store';

import { PickerDataType } from '@/components/picker/types';

/**
 * Generates semester options from 2021 to current year
 * @returns Array of {label: string, value: string} objects
 * @example
 * // Returns:
 * // [[
 * //   {label: '2021学年-第一学期', value: '2021-1'},
 * //   {label: '2021学年-第二学期', value: '2021-2'},
 * //   ...
 * // ]]
 */
export const generateSemesterOptions = (): PickerDataType => {
  const userInfo = getItem('userInfo');
  const lastYear = JSON.parse(userInfo as string).student_id.slice(0, 4);
  const currentYear = new Date().getFullYear() - 1;
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const options = [];

  // Determine if current time is first or second semester
  // Assuming first semester is March-August (month 3-8), second is September-February
  const currentSemester = currentMonth >= 3 && currentMonth <= 8 ? 1 : 2;

  for (let year = lastYear; year <= currentYear; year++) {
    // For current year, only add semesters that have passed
    if (year === currentYear) {
      options.push({
        label: `${year}学年-第一学期`,
        value: `${year}-1`,
      });

      if (currentSemester >= 1) {
        options.push({
          label: `${year}学年-第二学期`,
          value: `${year}-2`,
        });
      }
    } else {
      // For past years, add both semesters
      options.push(
        {
          label: `${year}学年-第一学期`,
          value: `${year}-1`,
        },
        {
          label: `${year}学年-第二学期`,
          value: `${year}-2`,
        }
      );
    }
  }

  return [options.reverse()];
};
