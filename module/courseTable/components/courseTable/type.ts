export type courseType = {
  courseName: string;
  time: string;
  date: string;
  teacher: string;
  classroom: string;
};
export interface CourseTableProps {
  data: courseType[];
}
