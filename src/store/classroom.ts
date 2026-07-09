import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ---- Classroom Star Store ----

interface ClassroomStarState {
  starredClassrooms: string[];
  addStarredClassroom: (roomNumber: string) => void;
  removeStarredClassroom: (roomNumber: string) => void;
  toggleStarredClassroom: (roomNumber: string) => void;
  isClassroomStarred: (roomNumber: string) => boolean;
  clearAllStarredClassrooms: () => void;
}

export const useClassroomStarStore = create<ClassroomStarState>()(
  persist(
    (set, get) => ({
      starredClassrooms: [],

      addStarredClassroom: (roomNumber: string) => {
        const { starredClassrooms } = get();
        if (!starredClassrooms.includes(roomNumber)) {
          set({ starredClassrooms: [...starredClassrooms, roomNumber] });
        }
      },

      removeStarredClassroom: (roomNumber: string) => {
        const { starredClassrooms } = get();
        set({
          starredClassrooms: starredClassrooms.filter(
            room => room !== roomNumber
          ),
        });
      },

      toggleStarredClassroom: (roomNumber: string) => {
        const {
          isClassroomStarred,
          addStarredClassroom,
          removeStarredClassroom,
        } = get();
        if (isClassroomStarred(roomNumber)) {
          removeStarredClassroom(roomNumber);
        } else {
          addStarredClassroom(roomNumber);
        }
      },

      isClassroomStarred: (roomNumber: string) => {
        const { starredClassrooms } = get();
        return starredClassrooms.includes(roomNumber);
      },

      clearAllStarredClassrooms: () => {
        set({ starredClassrooms: [] });
      },
    }),
    {
      name: 'classroom-star-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ---- Classroom Warning Store ----

interface ClassroomWarningState {
  hydrated: boolean;
  warningShown: boolean;
  setHydrated: (hydrated: boolean) => void;
  setWarningShown: (shown: boolean) => void;
}

export const useClassroomWarningStore = create<ClassroomWarningState>()(
  persist(
    set => ({
      hydrated: false,
      warningShown: false,
      setHydrated: hydrated => set({ hydrated }),
      setWarningShown: warningShown => set({ warningShown }),
    }),
    {
      name: 'classroom-warning',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: state => {
        return () => {
          state?.setHydrated(true);
        };
      },
    }
  )
);
