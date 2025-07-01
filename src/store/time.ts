import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TimeState {
  semester: string;
  setSemester: (_semester: string) => void;
  year: string;
  setYear: (_year: string) => void;
  currentWeek: number;
  setCurrentWeek: (_week: number) => void;
  showWeekPicker: boolean;
  setShowWeekPicker: (_opened: boolean) => void;
}

const useTimeStore = create<TimeState>()(
  persist(
    set => {
      return {
        semester: '',
        setSemester: (semester: string) => set({ semester }),
        year: '',
        setYear: (year: string) => set({ year }),
        currentWeek: 1,
        setCurrentWeek: (week: number) => set({ currentWeek: week }),
        showWeekPicker: false,
        setShowWeekPicker: (showWeekPicker: boolean) =>
          set({ showWeekPicker: showWeekPicker }),
      };
    },
    {
      name: 'time',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useTimeStore;
