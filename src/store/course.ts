import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { courseType } from '@/modules/courseTable/components/courseTable/type';

interface CourseState {
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  courses: courseType[];
  updateCourses: (courses: courseType[]) => void;
  addCourse: (course: courseType) => void;
  deleteCourse: (course: courseType) => void;
}

const useCourse = create<CourseState>()(
  persist(
    set => {
      return {
        hydrated: false,
        setHydrated: (hydrated: boolean) => set({ hydrated }),
        courses: [],
        updateCourses: (courses: courseType[]) => set({ courses }),
        addCourse: (course: courseType) => {
          set(state => ({ courses: [...state.courses, course] }));
        },
        deleteCourse: (course: courseType) => {
          set(state => ({
            courses: state.courses.filter(c => c.id !== course.id),
          }));
        },
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
