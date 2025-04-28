import { create } from 'zustand';

interface TimeState {
  currentWeek: number;
  setCurrentWeek: (_week: number) => void;
  showWeekPicker: boolean;
  setShowWeekPicker: (_opened: boolean) => void;
  holidayTime: number;
  setHolidayTime: (_time: number) => void;
  schoolTime: number;
  setSchoolTime: (_time: number) => void;
}

const useTimeStore = create<TimeState>(set => ({
  currentWeek: 1,
  setCurrentWeek: (week: number) => set({ currentWeek: week }),
  showWeekPicker: false,
  setShowWeekPicker: (showWeekPicker: boolean) =>
    set({ showWeekPicker: showWeekPicker }),
  holidayTime: 0,
  setHolidayTime: (_time: number) => set({ holidayTime: _time }),
  schoolTime: 0,
  setSchoolTime: (_time: number) => set({ schoolTime: _time }),
}));

export default useTimeStore;
