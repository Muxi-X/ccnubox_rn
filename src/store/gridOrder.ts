import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mainPageApplications } from '@/constants/mainPageApplications';
import { MainPageGridDataType } from '@/types/mainPageGridTypes';

interface GridOrderState {
  // 状态
  gridData: MainPageGridDataType[];

  // 方法
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
      name: 'grid-order-storage', // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),

      // 【关键配置】只持久化必要的数据
      partialize: state => ({
        // 只保存 key 顺序，不保存完整数据（节省存储空间）
        gridData: state.gridData.map(item => ({ key: item.key })),
      }),

      // 【关键配置】数据恢复时的处理
      onRehydrateStorage: () => state => {
        if (state) {
          // 从保存的 key 顺序重建完整数据
          const savedOrder = state.gridData;
          const fullData = savedOrder
            .map(({ key }) =>
              mainPageApplications.find(item => item.key === key)
            )
            .filter(Boolean) as MainPageGridDataType[];

          state.gridData = fullData.length ? fullData : mainPageApplications;
        }
      },
    }
  )
);

export default useGridOrder;
