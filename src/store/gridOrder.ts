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

// 确保"更多"选项始终在最后
const ensureMoreLast = (data: MainPageGridDataType[]) => {
  const moreIndex = data.findIndex(item => item.key === 'grid-13');
  if (moreIndex === -1 || moreIndex === data.length - 1) {
    return data;
  }

  const newData = [...data];
  const [moreItem] = newData.splice(moreIndex, 1);
  newData.push(moreItem);
  return newData;
};

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

  const result =
    ordered.length || remaining.length ? [...ordered, ...remaining] : apps;
  return ensureMoreLast(result);
};

const useGridOrder = create<GridOrderState>()(
  persist(
    set => ({
      // 初始状态
      gridData: getMainPageApplications(),

      // 更新顺序（确保"更多"始终在最后）
      updateGridOrder: newOrder => set({ gridData: ensureMoreLast(newOrder) }),

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
