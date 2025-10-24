import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ElectricityStore {
  // 已选择的宿舍信息
  selectedDorm: {
    building: string;
    room: string;
    area: string;
    room_id: string;
  } | null;
  // 设置宿舍信息
  setSelectedDorm: (dorm: {
    building: string;
    room: string;
    area: string;
    room_id: string;
  }) => void;
  // 清除宿舍信息
  clearSelectedDorm: () => void;
}

export const useElectricityStore = create<ElectricityStore>()(
  persist(
    set => ({
      selectedDorm: null,
      setSelectedDorm: dorm => set({ selectedDorm: dorm }),
      clearSelectedDorm: () => set({ selectedDorm: null }),
    }),
    {
      name: 'electricity-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
