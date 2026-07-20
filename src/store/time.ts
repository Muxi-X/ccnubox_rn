import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  calculateSemesterWeekCount,
  calculateWeekFromStart,
  clampWeekToSemester,
} from '@/utils/semesterWeeks';

interface TimeState {
  semester: string;
  setSemester: (_semester: string) => void;
  year: string;
  setYear: (_year: string) => void;
  selectedWeek: number;
  setSelectedWeek: (_week: number) => void;
  holidayTime: number;
  setHolidayTime: (_time: number) => void;
  schoolTime: number;
  setSchoolTime: (_time: number) => void;
  showWeekPicker: boolean;
  setShowWeekPicker: (_opened: boolean) => void;
  getCurrentWeek: () => number;
  getSemesterWeekCount: () => number;
}

const useTimeStore = create<TimeState>()(
  persist(
    (set, get) => {
      return {
        semester: '',
        setSemester: (semester: string) => set({ semester }),
        year: '',
        setYear: (year: string) => set({ year }),
        selectedWeek: 1,
        setSelectedWeek: (week: number) => {
          const totalWeeks = get().getSemesterWeekCount();
          set({ selectedWeek: clampWeekToSemester(week, totalWeeks) });
        },
        holidayTime: 0,
        setHolidayTime: (_time: number) => set({ holidayTime: _time }),
        schoolTime: 0,
        setSchoolTime: (_time: number) => set({ schoolTime: _time }),
        showWeekPicker: false,
        setShowWeekPicker: (showWeekPicker: boolean) =>
          set({ showWeekPicker: showWeekPicker }),
        getCurrentWeek: () => calculateWeekFromStart(get().schoolTime),
        getSemesterWeekCount: () => {
          const { schoolTime, holidayTime } = get();
          return calculateSemesterWeekCount(schoolTime, holidayTime);
        },
      };
    },
    {
      name: 'time',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useTimeStore;
