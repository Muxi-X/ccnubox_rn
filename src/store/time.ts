import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import useCourse from './course';

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
      };
    },
    {
      name: 'time',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useTimeStore;
