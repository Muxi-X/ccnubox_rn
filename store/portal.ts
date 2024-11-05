import React, { ReactElement } from 'react';
import { create } from 'zustand';

import { keyGenerator } from '@/utils/autoKey';

interface ModalStore {
  portalRef: React.RefObject<any>;
  elements: Record<number, ReactElement>;
  setPortalRef: (ref: React.RefObject<any>) => void;
  updateChildren: (newChildren: ReactElement, portalType?: string) => void;
  deleteChildren: (key: number) => void;
  updateFromElements: () => void;
}

export const usePortalStore = create<ModalStore>((set, get) => ({
  portalRef: React.createRef(),
  elements: {},
  elementTypeMap: {},
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
