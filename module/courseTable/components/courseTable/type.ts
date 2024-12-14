export type courseType = {
  courseName: string;
  time: string;
  date: string;
  teacher: string;
  classroom: string;
  timeSpan?: number;
};
export interface CourseTableProps {
  data: courseType[];
}

// 课程中间类型,比 courseType 增加 rowIndex 和 colIndex
export interface CourseTransferType {
  courseName: string;
  teacher: string;
  classroom: string;
  timeSpan: number;
  rowIndex: number;
  colIndex: number;
  date: string;
}
