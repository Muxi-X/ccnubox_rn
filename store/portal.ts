import React, { ReactElement } from 'react';
import { create } from 'zustand';

import { PortalStore } from '@/store/types';
import { keyGenerator } from '@/utils/autoKey';

export const usePortalStore = create<PortalStore>((set, get) => ({
  portalRef: React.createRef(),
  elements: {},
  setPortalRef: ref => set({ portalRef: ref }),
  updateFromElements: () => {
    const { elements, portalRef } = get();
    const portalInst = portalRef.current;
    if (portalInst)
      portalInst.setChildren([
        ...Object.entries(elements).map(element => element[1] as ReactElement),
      ]);
  },
  updateChildren: (newChildren, portalType = 'common') => {
    let tmpMap: Record<number, ReactElement> = get().elements;
    const { updateFromElements } = get();
    if (newChildren) {
      const key = keyGenerator.next().value as unknown as number;
      tmpMap[key] = React.cloneElement(newChildren, {
        key,
        portalType,
        currentKey: key,
      });
    }
    set({
      elements: tmpMap,
    });
    updateFromElements();
  },
  deleteChildren: key => {
    const { elements, updateFromElements } = get();
    delete elements[key];
    updateFromElements();
  },
}));
