import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface BackgroundCropRect {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

interface CourseTableAppearanceState {
  backgroundUri?: string;
  backgroundSourceUri?: string;
  backgroundSourceSize?: { width: number; height: number };
  backgroundScrollableCropUri?: string;
  backgroundScrollableCropRect?: BackgroundCropRect;
  backgroundFixedCropUri?: string;
  backgroundFixedCropRect?: BackgroundCropRect;
  backgroundViewportSize?: { width: number; height: number };
  backgroundScrollable: boolean;
  foregroundOpacity: number;
  backgroundMaskOpacity: number;
  backgroundBlurRadius: number;
  setBackgroundUri: (uri?: string) => void;
  setBackgroundSource: (
    uri?: string,
    size?: { width: number; height: number }
  ) => void;
  setBackgroundCrop: (
    scrollable: boolean,
    uri: string,
    rect: BackgroundCropRect
  ) => void;
  setBackgroundViewportSize: (size: { width: number; height: number }) => void;
  setBackgroundScrollable: (scrollable: boolean) => void;
  setForegroundOpacity: (opacity: number) => void;
  setBackgroundMaskOpacity: (opacity: number) => void;
  setBackgroundBlurRadius: (radius: number) => void;
  reset: () => void;
}

const useCourseTableAppearance = create<CourseTableAppearanceState>()(
  persist(
    set => ({
      backgroundUri: undefined,
      backgroundSourceUri: undefined,
      backgroundSourceSize: undefined,
      backgroundScrollableCropUri: undefined,
      backgroundScrollableCropRect: undefined,
      backgroundFixedCropUri: undefined,
      backgroundFixedCropRect: undefined,
      backgroundViewportSize: undefined,
      backgroundScrollable: true,
      foregroundOpacity: 0,
      backgroundMaskOpacity: 0,
      backgroundBlurRadius: 0,

      setBackgroundUri: (uri?: string) =>
        set({
          backgroundUri: uri,
          backgroundSourceUri: uri,
          backgroundSourceSize: undefined,
          backgroundScrollableCropUri: undefined,
          backgroundScrollableCropRect: undefined,
          backgroundFixedCropUri: undefined,
          backgroundFixedCropRect: undefined,
        }),
      setBackgroundSource: (uri, size) =>
        set({
          backgroundUri: uri,
          backgroundSourceUri: uri,
          backgroundSourceSize: size,
          backgroundScrollableCropUri: undefined,
          backgroundScrollableCropRect: undefined,
          backgroundFixedCropUri: undefined,
          backgroundFixedCropRect: undefined,
        }),
      setBackgroundCrop: (scrollable, uri, rect) =>
        set(state =>
          scrollable
            ? {
                backgroundScrollableCropUri: uri,
                backgroundScrollableCropRect: rect,
                backgroundUri: state.backgroundScrollable
                  ? uri
                  : state.backgroundUri,
              }
            : {
                backgroundFixedCropUri: uri,
                backgroundFixedCropRect: rect,
                backgroundUri: state.backgroundScrollable
                  ? state.backgroundUri
                  : uri,
              }
        ),
      setBackgroundViewportSize: size =>
        set(state => {
          if (size.width <= 0 || size.height <= 0) return state;
          if (
            state.backgroundViewportSize?.width === size.width &&
            state.backgroundViewportSize?.height === size.height
          ) {
            return state;
          }
          return { backgroundViewportSize: size };
        }),
      setBackgroundScrollable: (scrollable: boolean) =>
        set(state => ({
          backgroundScrollable: scrollable,
          backgroundUri: scrollable
            ? state.backgroundScrollableCropUri ||
              state.backgroundSourceUri ||
              state.backgroundUri
            : state.backgroundFixedCropUri ||
              state.backgroundSourceUri ||
              state.backgroundUri,
        })),
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
          backgroundSourceUri: undefined,
          backgroundSourceSize: undefined,
          backgroundScrollableCropUri: undefined,
          backgroundScrollableCropRect: undefined,
          backgroundFixedCropUri: undefined,
          backgroundFixedCropRect: undefined,
          backgroundViewportSize: undefined,
          backgroundScrollable: true,
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
