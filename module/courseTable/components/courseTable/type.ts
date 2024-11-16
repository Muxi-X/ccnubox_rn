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

export interface CourseTransferType {
  courseName: string;
  timeSpan: number;
  rowIndex: number;
  colIndex: number;
}
