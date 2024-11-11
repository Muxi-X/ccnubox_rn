export type courseType = {
  courseName: string;
  time: string;
  date: string;
  timeSpan?: number;
};
export interface CourseTableProps {
  data: courseType[];
}
