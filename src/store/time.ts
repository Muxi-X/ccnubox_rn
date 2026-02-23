import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import useCourse from './course';

/**
 * 根据开学时间戳计算当前学期和学年
 * @param startTimestamp 开学时间（秒级时间戳）
 */
const computeSemesterAndYear = (startTimestamp: number) => {
  const startDate = new Date(startTimestamp * 1000);
  const month = startDate.getMonth() + 1;
  let semester = '1';
  let year = startDate.getFullYear().toString();

  if (month >= 1 && month <= 5) {
    semester = '2';
    year = (new Date().getFullYear() - 1).toString();
  } else if (month >= 6 && month <= 7) {
    semester = '3';
    year = (new Date().getFullYear() - 1).toString();
  } else if (month >= 8 && month <= 12) {
    semester = '1';
    year = new Date().getFullYear().toString();
  }
  return { semester, year };
};

interface TimeState {
  semester: string;
  setSemester: (_semester: string) => void;
  year: string;
  setYear: (_year: string) => void;
  selectedWeek: number;
  setSelectedWeek: (_week: number) => void;
  showWeekPicker: boolean;
  setShowWeekPicker: (_opened: boolean) => void;
  getCurrentWeek: () => number;
  /** 根据开学时间戳计算并更新 semester/year */
  computeAndSetSemester: (_startTimestamp: number) => void;
}

const useTimeStore = create<TimeState>()(
  persist(
    set => {
      return {
        semester: '',
        setSemester: (semester: string) => set({ semester }),
        year: '',
        setYear: (year: string) => set({ year }),
        selectedWeek: 1,
        setSelectedWeek: (week: number) => set({ selectedWeek: week }),
        showWeekPicker: false,
        setShowWeekPicker: (showWeekPicker: boolean) =>
          set({ showWeekPicker: showWeekPicker }),
        getCurrentWeek: () => {
          const startTimestamp = useCourse.getState().schoolTime * 1000;
          const diffTime = new Date().getTime() - startTimestamp;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          return Math.floor(diffDays / 7) + 1;
        },
        computeAndSetSemester: (startTimestamp: number) => {
          const { semester, year } = computeSemesterAndYear(startTimestamp);
          set({ semester, year });
        },
      };
    },
    {
      name: 'time',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { computeSemesterAndYear };
export default useTimeStore;
