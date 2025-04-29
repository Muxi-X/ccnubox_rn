import { create } from 'zustand';

interface TimeState {
  currentWeek: number;
  setCurrentWeek: (_week: number) => void;
  showWeekPicker: boolean;
  setShowWeekPicker: (_opened: boolean) => void;
}

const useTimeStore = create<TimeState>(set => ({
  currentWeek: 1,
  setCurrentWeek: (week: number) => set({ currentWeek: week }),
  showWeekPicker: false,
  setShowWeekPicker: (showWeekPicker: boolean) =>
    set({ showWeekPicker: showWeekPicker }),
}));

export default useTimeStore;
