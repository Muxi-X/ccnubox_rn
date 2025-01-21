export type courseType = {
  info: {
    class_when: string;
    classname: string;
    credit: number;
    day: number;
    id: string;
    semester: string;
    teacher: string;
    week_duration: string;
    weeks: number;
    where: string;
    year: string;
  }[];
  thisweek: boolean;
};

export interface CourseTableProps {
  data: courseType[];
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
}
