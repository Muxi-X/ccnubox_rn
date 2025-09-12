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
  deleteCourse: (id: string) => void;
  lastUpdate: number;
  setLastUpdate: (time: number) => void;
  holidayTime: number;
  setHolidayTime: (_time: number) => void;
  schoolTime: number;
  setSchoolTime: (_time: number) => void;
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
        deleteCourse: (id: string) => {
          set(state => ({
            courses: state.courses.filter(c => c.id !== id),
          }));
        },
        lastUpdate: 0,
        setLastUpdate: (time: number) => set({ lastUpdate: time }),
        holidayTime: 0,
        setHolidayTime: (_time: number) => set({ holidayTime: _time }),
        schoolTime: 0,
        setSchoolTime: (_time: number) => set({ schoolTime: _time }),
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
