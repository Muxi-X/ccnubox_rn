import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
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
const { WidgetManager } = NativeModules;
const useCourse = create<CourseState>()(
  persist(
    set => {
      return {
        hydrated: false,
        setHydrated: (hydrated: boolean) => set({ hydrated }),
        courses: [],
        updateCourses: (courses: courseType[]) => {
          // 推送到小组件
          if (Platform.OS === 'android') {
            WidgetManager.updateCourseData(JSON.stringify(courses))
              .then((result: string) => {
                console.log('数据更新成功:', result); // Force widget to refresh
                WidgetManager.refreshWidget?.();
              })
              .catch((error: unknown) => {
                console.error('数据更新失败:', error);
              });
          }

          set({ courses });
        },
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
