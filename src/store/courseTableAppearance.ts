import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CourseTableAppearanceState {
  backgroundUri?: string;
  backgroundMode: 'cover' | 'contain' | 'stretch';
  foregroundOpacity: number;
  backgroundMaskEnabled: boolean;
  setBackgroundUri: (uri?: string) => void;
  setBackgroundMode: (mode: 'cover' | 'contain' | 'stretch') => void;
  setForegroundOpacity: (opacity: number) => void;
  setBackgroundMaskEnabled: (enabled: boolean) => void;
  reset: () => void;
}

const useCourseTableAppearance = create<CourseTableAppearanceState>()(
  persist(
    set => ({
      backgroundUri: undefined,
      backgroundMode: 'cover',
      foregroundOpacity: 100,
      backgroundMaskEnabled: false,

      setBackgroundUri: (uri?: string) => set({ backgroundUri: uri }),
      setBackgroundMode: (mode: 'cover' | 'contain' | 'stretch') =>
        set({ backgroundMode: mode }),
      setForegroundOpacity: (opacity: number) =>
        set({
          foregroundOpacity: Math.max(0, Math.min(100, Math.round(opacity))),
        }), // 限制在 0-100 之间并转为整数
      setBackgroundMaskEnabled: (enabled: boolean) =>
        set({ backgroundMaskEnabled: enabled }),
      reset: () =>
        set({
          backgroundUri: undefined,
          backgroundMode: 'cover',
          foregroundOpacity: 100,
          backgroundMaskEnabled: false,
        }),
    }),
    {
      name: 'courseTableAppearance',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCourseTableAppearance;
