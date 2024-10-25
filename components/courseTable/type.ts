export type courseType = {
  courseName: string;
  time: string;
  date: string;
};
export interface CourseTableProps {
  data: courseType[];
}
