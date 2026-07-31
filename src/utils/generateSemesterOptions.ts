import type { PickerDataType } from '@/components/picker/types';

import type { components } from '@/request/schema';

type SemesterResponse = components['schemas']['content.Semester'];

/** 学期选项基础结构 */
export interface SemesterOptionBase {
  label: string;
  year: string;
  semester: string;
  startTimestamp: number;
  endTimestamp: number;
}

const SEMESTER_LABELS: Record<string, string> = {
  '1': '第一学期',
  '2': '第二学期',
  '3': '第三学期',
};

const parseDateTimestamp = (value?: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return 0;

  const [, year, month, day] = match;
  return Math.floor(
    new Date(Number(year), Number(month) - 1, Number(day)).getTime() / 1000
  );
};

export const parseSemester = (semester?: SemesterResponse) => {
  const match = /^(\d{4})-([123])$/.exec(semester?.semester ?? '');
  if (!match) return null;

  const [, year, semesterNumber] = match;
  const startTimestamp = parseDateTimestamp(semester?.start_date);
  const endTimestamp = parseDateTimestamp(semester?.end_date);
  if (!startTimestamp || !endTimestamp || endTimestamp <= startTimestamp) {
    return null;
  }

  return {
    label: `${year.slice(2)}~${String(Number(year) + 1).slice(2)}学年-${SEMESTER_LABELS[semesterNumber]}`,
    year,
    semester: semesterNumber,
    startTimestamp,
    endTimestamp,
  } satisfies SemesterOptionBase;
};

/** 将接口学期列表转换为统一的页面选项，并按学期倒序排列。 */
export const buildSemesterOptions = (
  semesters: SemesterResponse[]
): SemesterOptionBase[] => {
  return semesters
    .map(parseSemester)
    .filter((option): option is SemesterOptionBase => option !== null)
    .sort(
      (a, b) =>
        Number(b.year) - Number(a.year) ||
        Number(b.semester) - Number(a.semester)
    );
};

/**
 * 生成 Picker 组件所需的学期选项（多选成绩等场景）
 */
export const generateSemesterOptions = (
  semesters: SemesterResponse[]
): PickerDataType => {
  const opts = buildSemesterOptions(semesters);
  return [
    opts.map(o => ({ label: o.label, value: `${o.year}-${o.semester}` })),
  ];
};
