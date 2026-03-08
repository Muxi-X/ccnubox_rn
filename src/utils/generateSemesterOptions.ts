import { PickerDataType } from '@/components/picker/types';

/** 学期选项基础结构 */
export interface SemesterOptionBase {
  label: string;
  year: string;
  semester: string;
}

const SEMESTER_LABELS: Record<string, string> = {
  '1': '第一学期',
  '2': '第二学期',
  '3': '第三学期',
};

/**
 * 根据学号前四位和当前日期计算学期列表（入学到当前）
 *
 * 逻辑：
 * - 学年：9 月起算新学年
 * - 学期：9-1 第一学期，2-6 第二学期，7-8 第三学期
 */
export const computeSemesterOptions = (
  studentId: string
): SemesterOptionBase[] => {
  if (!studentId || studentId.length < 4) return [];
  const admissionYear = Number(studentId.slice(0, 4));
  if (isNaN(admissionYear) || admissionYear <= 0) return [];

  const today = new Date();
  const currentCalendarYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const currentAcademicYear =
    currentMonth >= 9 ? currentCalendarYear : currentCalendarYear - 1;

  let currentSemester = 1;
  if (currentMonth >= 2 && currentMonth <= 6) {
    currentSemester = 2;
  } else if (currentMonth >= 7 && currentMonth <= 8) {
    currentSemester = 3;
  }

  const options: SemesterOptionBase[] = [];
  for (let y = admissionYear; y <= currentAcademicYear; y++) {
    const maxSem = y === currentAcademicYear ? currentSemester : 3;
    for (let s = 1; s <= maxSem; s++) {
      options.push({
        label: `${String(y).slice(2)}~${String(y + 1).slice(2)}学年-${SEMESTER_LABELS[String(s)]}`,
        year: String(y),
        semester: String(s),
      });
    }
  }
  return options.reverse();
};

/**
 * 生成 Picker 组件所需的学期选项（多选成绩等场景）
 */
export const generateSemesterOptions = (studentId: string): PickerDataType => {
  const opts = computeSemesterOptions(studentId);
  return [
    opts.map(o => ({ label: o.label, value: `${o.year}-${o.semester}` })),
  ];
};

/**
 * 生成课表周选择器所需的学期选项
 */
export const buildSemesterOptions = (
  studentId: string
): SemesterOptionBase[] => {
  return computeSemesterOptions(studentId);
};
