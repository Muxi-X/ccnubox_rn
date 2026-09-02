import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  calculateSemesterWeekCount,
  calculateWeekFromStart,
  clampWeekToSemester,
} from '@/utils/semesterWeeks';

const TIME_STORE_VERSION = 2;
const MAX_REASONABLE_WEEK = 60;

interface PersistedTimeState {
  semester: string;
  year: string;
  selectedWeek: number;
  holidayTime: number;
  schoolTime: number;
}

interface TimeState extends PersistedTimeState {
  hydrated: boolean;
  rehydrateError: string | null;
  setHydrated: (_hydrated: boolean, _error?: string | null) => void;
  setSemester: (_semester: string) => void;
  setYear: (_year: string) => void;
  setSemesterContext: (_context: PersistedTimeState) => void;
  setSelectedWeek: (_week: number) => void;
  setHolidayTime: (_time: number) => void;
  setSchoolTime: (_time: number) => void;
  showWeekPicker: boolean;
  setShowWeekPicker: (_opened: boolean) => void;
  getCurrentWeek: () => number;
  getSemesterWeekCount: () => number;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeScopeValue = (value: unknown, pattern: RegExp) =>
  typeof value === 'string' && pattern.test(value) ? value : '';

const normalizeTimestamp = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;

const normalizeWeek = (value: unknown) => {
  const week = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(week)
    ? clampWeekToSemester(Math.round(week), MAX_REASONABLE_WEEK)
    : 1;
};

const normalizePersistedTime = (value: unknown): PersistedTimeState => {
  if (!isRecord(value)) {
    return {
      semester: '',
      year: '',
      selectedWeek: 1,
      holidayTime: 0,
      schoolTime: 0,
    };
  }

  return {
    semester: normalizeScopeValue(value.semester, /^[123]$/),
    year: normalizeScopeValue(value.year, /^\d{4}$/),
    selectedWeek: normalizeWeek(value.selectedWeek),
    holidayTime: normalizeTimestamp(value.holidayTime),
    schoolTime: normalizeTimestamp(value.schoolTime),
  };
};

const useTimeStore = create<TimeState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      rehydrateError: null,
      setHydrated: (hydrated, error = null) =>
        set({ hydrated, rehydrateError: error }),
      semester: '',
      setSemester: semester =>
        set({ semester: normalizeScopeValue(semester, /^[123]$/) }),
      year: '',
      setYear: year => set({ year: normalizeScopeValue(year, /^\d{4}$/) }),
      setSemesterContext: context => set(normalizePersistedTime(context)),
      selectedWeek: 1,
      setSelectedWeek: week => set({ selectedWeek: normalizeWeek(week) }),
      holidayTime: 0,
      setHolidayTime: holidayTime =>
        set({ holidayTime: normalizeTimestamp(holidayTime) }),
      schoolTime: 0,
      setSchoolTime: schoolTime =>
        set({ schoolTime: normalizeTimestamp(schoolTime) }),
      showWeekPicker: false,
      setShowWeekPicker: showWeekPicker => set({ showWeekPicker }),
      getCurrentWeek: () => calculateWeekFromStart(get().schoolTime),
      getSemesterWeekCount: () => {
        const { schoolTime, holidayTime } = get();
        return calculateSemesterWeekCount(schoolTime, holidayTime);
      },
    }),
    {
      name: 'time',
      version: TIME_STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        semester: state.semester,
        year: state.year,
        selectedWeek: state.selectedWeek,
        holidayTime: state.holidayTime,
        schoolTime: state.schoolTime,
      }),
      migrate: persistedState => normalizePersistedTime(persistedState),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedTime(persistedState),
      }),
      onRehydrateStorage: () => (state, error) => {
        const errorMessage =
          error instanceof Error ? error.message : error ? String(error) : null;
        if (state) state.setHydrated(true, errorMessage);
        else
          useTimeStore.setState({
            hydrated: true,
            rehydrateError: errorMessage,
          });
      },
    }
  )
);

export default useTimeStore;
