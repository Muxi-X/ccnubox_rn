import { create } from 'zustand';

interface WeekState {
  currentWeek: number;
  setCurrentWeek: (_week: number) => void;
  showWeekPicker: boolean;
  setShowWeekPicker: (_opened: boolean) => void;
}

const useWeekStore = create<WeekState>(set => ({
  currentWeek: 1,
  setCurrentWeek: (week: number) => set({ currentWeek: week }),
  showWeekPicker: false,
  setShowWeekPicker: (showWeekPicker: boolean) =>
    set({ showWeekPicker: showWeekPicker }),
}));

export default useWeekStore;
