import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { courseType } from '@/modules/courseTable/components/courseTable/type';
import { updateCourseWidgetData } from '@/utils/updateWidget';

interface CourseState {
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  courses: courseType[];
  courseCategories: string[];
  updateCourses: (courses: courseType[]) => void;
  updatecourseCategories: (coursesCategory: string[]) => void;
  addCourse: (course: courseType) => void;
  deleteCourse: (id: string) => void;
  updateCourseNote: (id: string, note: string) => void;
  lastUpdate: number;
  setLastUpdate: (time: number) => void;
}

const useCourse = create<CourseState>()(
  persist(
    set => {
      return {
        hydrated: false,
        setHydrated: (hydrated: boolean) => set({ hydrated }),
        courses: [],
        courseCategories: [],
        updateCourses: (courses: courseType[]) => {
          set(state => ({
            courses,
            courseCategories: state.courseCategories,
          }));
          void updateCourseWidgetData(courses);
        },
        updatecourseCategories: (courseCategories: string[]) => {
          set(state => ({
            courses: state.courses,
            courseCategories,
          }));
        },
        addCourse: (course: courseType) => {
          const courses = [...useCourse.getState().courses, course];
          set({ courses });
          void updateCourseWidgetData(courses);
        },
        deleteCourse: (id: string) => {
          const courses = useCourse.getState().courses.filter(c => c.id !== id);
          set({ courses });
          void updateCourseWidgetData(courses);
        },
        updateCourseNote: (id: string, note: string) => {
          const courses = useCourse
            .getState()
            .courses.map(course =>
              course.id === id ? { ...course, note } : course
            );
          set({ courses });
          void updateCourseWidgetData(courses);
        },
        lastUpdate: 0,
        setLastUpdate: (time: number) => set({ lastUpdate: time }),
      };
    },
    {
      name: 'courses',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: state => {
        return () => {
          state?.setHydrated(true);
        };
      },
    }
  )
);

export default useCourse;
