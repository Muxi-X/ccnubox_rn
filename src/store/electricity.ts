import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SelectedDormInfo {
  area: string; // 区域 (例如: "南湖学生宿舍")
  building: string; // 楼栋名称 (例如: "南湖07栋")
  architecture_id: string; // 楼栋ID (例如: "000411")
  floor: string; // 楼层 (例如: "3")
  room: string; // 宿舍/房间名 (例如: "南7-321")
  room_id?: string; // 设备ID
  ac?: string;
  light?: string;
  union?: string;
}

interface ElectricityStore {
  // 已选择的宿舍信息
  selectedDorm: SelectedDormInfo | null;
  // 设置宿舍信息
  setSelectedDorm: (dorm: SelectedDormInfo) => void;
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
