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

      merge: (persistedState, currentState) => {
        const inbound = persistedState as Partial<GridOrderState> | undefined;
        if (!inbound) {
          return currentState;
        }

        const { gridData: inboundGridData, ...rest } = inbound;
        const savedOrder = Array.isArray(inboundGridData)
          ? inboundGridData
          : [];

        const savedKeys = new Set(savedOrder.map(item => item.key));
        const existingApps = savedOrder
          .map(({ key }) => mainPageApplications.find(item => item.key === key))
          .filter((item): item is MainPageGridDataType => Boolean(item));

        const newApps = mainPageApplications.filter(
          app => !savedKeys.has(app.key)
        );

        const reconstructedGrid =
          existingApps.length || newApps.length
            ? [...existingApps, ...newApps]
            : mainPageApplications;

        return {
          ...currentState,
          ...rest,
          gridData: reconstructedGrid,
        };
      },
    }
  )
);

export default useGridOrder;
