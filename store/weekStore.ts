import { create } from 'zustand';

interface WeekState {
  currentWeek: string;
  setCurrentWeek: (week: string) => void;
  showWeekPicker: boolean;
  setShowWeekPicker: (opened: boolean) => void;
}

const useWeekStore = create<WeekState>(set => ({
  currentWeek: '1',
  setCurrentWeek: (week: string) => set({ currentWeek: week }),
  showWeekPicker: false,
  setShowWeekPicker: (showWeekPicker: boolean) =>
    set({ showWeekPicker: showWeekPicker }),
}));

export default useWeekStore;
