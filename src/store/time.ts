import { create } from 'zustand';

import useCourse from './course';

interface TimeState {
  selectedWeek: number;
  setSelectedWeek: (_week: number) => void;
  showWeekPicker: boolean;
  setShowWeekPicker: (_opened: boolean) => void;
  getCurrentWeek: () => number;
}

const useTimeStore = create<TimeState>(set => ({
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
}));

export default useTimeStore;
