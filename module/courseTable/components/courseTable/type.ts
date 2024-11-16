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
