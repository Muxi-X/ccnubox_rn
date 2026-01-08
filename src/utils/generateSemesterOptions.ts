import { PickerDataType } from '@/components/picker/types';

/**
 * Generates semester options based on the student's admission year and current date.
 *
 * Logic:
 * - Academic Year: Starts in September.
 *   - Sep-Dec of Year X belongs to Academic Year X.
 *   - Jan-Aug of Year X+1 belongs to Academic Year X.
 * - Semesters (based on month):
 *   - Sep-Jan: Semester 1 (First)
 *   - Feb-Jun: Semester 2 (Second)
 *   - Jul-Aug: Semester 3 (Third)
 *
 * @param {string} studentId The student's ID, used to determine the admission year.
 * @returns {PickerDataType} Array containing a single array of options in reverse chronological order.
 */
export const generateSemesterOptions = (studentId: string): PickerDataType => {
  const admissionYear = Number(studentId.slice(0, 4));
  const today = new Date();
  const currentCalendarYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12

  // Calculate current Academic Year
  // If we are in Jan-Aug, we are in the academic year that started the previous calendar year.
  // e.g., Jan 2026 is in Academic Year 2025. Sep 2026 is in Academic Year 2026.
  const currentAcademicYear =
    currentMonth >= 9 ? currentCalendarYear : currentCalendarYear - 1;

  // Determine current semester
  // 9-1: Semester 1
  // 2-6: Semester 2
  // 7-8: Semester 3
  let currentSemester = 1;
  if (currentMonth >= 2 && currentMonth <= 6) {
    currentSemester = 2;
  } else if (currentMonth >= 7 && currentMonth <= 8) {
    currentSemester = 3;
  }
  // Month 9-12 and 1-2 default to Semester 1

  const options = [];

  for (let year = admissionYear; year <= currentAcademicYear; year++) {
    const isCurrentYear = year === currentAcademicYear;
    // If it's the current academic year, limit by currentSemester.
    // Otherwise (past years), show all 3 semesters.
    const maxSemester = isCurrentYear ? currentSemester : 3;

    if (maxSemester >= 1) {
      options.push({
        label: `${String(year).slice(2)}~${String(year + 1).slice(2)}学年-第一学期`,
        value: `${year}-1`,
      });
    }

    if (maxSemester >= 2) {
      options.push({
        label: `${String(year).slice(2)}~${String(year + 1).slice(2)}学年-第二学期`,
        value: `${year}-2`,
      });
    }

    if (maxSemester >= 3) {
      options.push({
        label: `${String(year).slice(2)}~${String(year + 1).slice(2)}学年-第三学期`,
        value: `${year}-3`,
      });
    }
  }

  return [options.reverse()];
};
