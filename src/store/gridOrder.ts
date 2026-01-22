import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import globalEventBus from '@/utils/eventBus';
import { getMainPageApplications } from '@/utils/getMainPageApps';

import { MainPageGridDataType } from '@/types/mainPageGridTypes';

interface GridOrderState {
  gridData: MainPageGridDataType[];

  updateGridOrder: (newOrder: MainPageGridDataType[]) => void;
  resetGridOrder: () => void;
}

const buildGridDataWithOrder = (
  order: MainPageGridDataType[] | { key: string }[]
) => {
  const apps = getMainPageApplications();
  const appMap = new Map(apps.map(app => [app.key, app]));

  const ordered = order
    .map(item => appMap.get(item.key))
    .filter((item): item is MainPageGridDataType => Boolean(item));

  const orderedKeys = new Set(ordered.map(item => item.key));
  const remaining = apps.filter(app => !orderedKeys.has(app.key));

  return ordered.length || remaining.length ? [...ordered, ...remaining] : apps;
};

const useGridOrder = create<GridOrderState>()(
  persist(
    set => ({
      // 初始状态
      gridData: getMainPageApplications(),

      // 更新顺序
      updateGridOrder: newOrder => set({ gridData: newOrder }),

      // 重置为默认顺序
      resetGridOrder: () => set({ gridData: getMainPageApplications() }),
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

        return {
          ...currentState,
          ...rest,
          gridData: buildGridDataWithOrder(savedOrder),
        };
      },
    }
  )
);

globalEventBus.on('layoutChange', () => {
  const state = useGridOrder.getState();
  const currentOrder = state.gridData.map(item => ({ key: item.key }));
  state.updateGridOrder(buildGridDataWithOrder(currentOrder));
});

globalEventBus.on('iconStyleChange', () => {
  const state = useGridOrder.getState();
  const currentOrder = state.gridData.map(item => ({ key: item.key }));
  state.updateGridOrder(buildGridDataWithOrder(currentOrder));
});

export default useGridOrder;
