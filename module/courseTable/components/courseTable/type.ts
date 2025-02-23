export type courseType = {
  class_when: string;
  classname: string;
  credit: number;
  day: number;
  id: string;
  semester: string;
  teacher: string;
  week_duration: string;
  weeks: number[];
  where: string;
  year: string;
};

export interface CourseTableProps {
  data: courseType[];
  currentWeek: string;
  onTimetableRefresh: () => void;
}

// 课程中间类型,比 courseType 增加 rowIndex 和 colIndex
export interface CourseTransferType {
  id: string;
  courseName: string;
  teacher: string;
  classroom: string;
  timeSpan: number;
  rowIndex: number;
  colIndex: number;
  date: string;
  isThisWeek: boolean;
}
