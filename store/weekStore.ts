import { create } from 'zustand';

interface WeekState {
  currentWeek: string;
  setCurrentWeek: (week: string) => void;
}

const useWeekStore = create<WeekState>(set => ({
  currentWeek: '1',
  setCurrentWeek: (week: string) => set({ currentWeek: week }),
}));

export default useWeekStore;
