import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mainPageApplications } from '@/constants/mainPageApplications';
import { MainPageGridDataType } from '@/types/mainPageGridTypes';

interface GridOrderState {
  gridData: MainPageGridDataType[];

  updateGridOrder: (newOrder: MainPageGridDataType[]) => void;
  resetGridOrder: () => void;
}

const useGridOrder = create<GridOrderState>()(
  persist(
    set => ({
      // 初始状态
      gridData: mainPageApplications,

      // 更新顺序
      updateGridOrder: newOrder => set({ gridData: newOrder }),

      // 重置为默认顺序
      resetGridOrder: () => set({ gridData: mainPageApplications }),
    }),
    {
      name: 'grid-order-storage',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: state => ({
        gridData: state.gridData.map(item => ({ key: item.key })),
      }),

      onRehydrateStorage: () => state => {
        if (!state) return;

        const savedOrder = state.gridData;
        const savedKeys = new Set(savedOrder.map(item => item.key));

        // 保留存在的应用(按保存的顺序)
        const existingApps = savedOrder
          .map(({ key }) => mainPageApplications.find(item => item.key === key))
          .filter((item): item is MainPageGridDataType => Boolean(item));

        // 添加新增的应用
        const newApps = mainPageApplications.filter(
          app => !savedKeys.has(app.key)
        );

        state.gridData = [...existingApps, ...newApps];
      },
    }
  )
);

export default useGridOrder;
