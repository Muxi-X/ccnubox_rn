import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CourseTableAppearanceState {
  backgroundUri?: string;
  backgroundMode: 'cover' | 'contain' | 'stretch';
  foregroundOpacity: number;
  backgroundMaskOpacity: number;
  backgroundBlurRadius: number;
  setBackgroundUri: (uri?: string) => void;
  setBackgroundMode: (mode: 'cover' | 'contain' | 'stretch') => void;
  setForegroundOpacity: (opacity: number) => void;
  setBackgroundMaskOpacity: (opacity: number) => void;
  setBackgroundBlurRadius: (radius: number) => void;
  reset: () => void;
}

const useCourseTableAppearance = create<CourseTableAppearanceState>()(
  persist(
    set => ({
      backgroundUri: undefined,
      backgroundMode: 'cover',
      foregroundOpacity: 0,
      backgroundMaskOpacity: 0,
      backgroundBlurRadius: 0,

      setBackgroundUri: (uri?: string) => set({ backgroundUri: uri }),
      setBackgroundMode: (mode: 'cover' | 'contain' | 'stretch') =>
        set({ backgroundMode: mode }),
      setForegroundOpacity: (opacity: number) =>
        set({
          foregroundOpacity: Math.max(0, Math.min(100, Math.round(opacity))),
        }),
      setBackgroundMaskOpacity: (opacity: number) =>
        set({
          backgroundMaskOpacity: Math.max(
            0,
            Math.min(100, Math.round(opacity))
          ),
        }),
      setBackgroundBlurRadius: (radius: number) =>
        set({
          backgroundBlurRadius: Math.max(0, Math.min(30, Math.round(radius))),
        }),
      reset: () =>
        set({
          backgroundUri: undefined,
          backgroundMode: 'cover',
          foregroundOpacity: 0,
          backgroundMaskOpacity: 0,
          backgroundBlurRadius: 0,
        }),
    }),
    {
      name: 'courseTableAppearance',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCourseTableAppearance;
