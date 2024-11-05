import React, { ReactElement } from 'react';
import { create } from 'zustand';

import { keyGenerator } from '@/utils/autoKey';

interface ModalStore {
  portalRef: React.RefObject<any>;
  elements: Record<number, ReactElement>;
  setPortalRef: (ref: React.RefObject<any>) => void;
  updateChildren: (newChildren: ReactElement, type?: string) => void;
  deleteChildren: (key: number, type?: string) => void;
  updateFromElements: () => void;
  elementTypeMap: Record<string, number[]>;
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
      portalInst.setChildren(
        Object.entries(elements).map(element => element[1] as ReactElement)
      );
  },
  updateChildren: (newChildren, type = 'common') => {
    let tmpMap: Record<number, ReactElement> = {};
    const { updateFromElements, elementTypeMap } = get();
    if (newChildren) {
      const key = keyGenerator.next().value as unknown as number;
      tmpMap[key] = React.cloneElement(newChildren, { key });
    }
    set({
      elements: tmpMap,
      elementTypeMap: {
        ...elementTypeMap,
        [type]: [
          ...(elementTypeMap[type] ?? []),
          ...Object.keys(tmpMap).map(key => Number(key)),
        ],
      },
    });
    console.log(elementTypeMap);
    updateFromElements();
  },
  deleteChildren: (key, type = 'common') => {
    const { elements, updateFromElements, elementTypeMap } = get();
    delete elements[key];
    set({
      elementTypeMap: {
        ...elementTypeMap,
        [type]: (elementTypeMap[type] ?? []).slice(0, -1),
      },
    });
    updateFromElements();
  },
}));
