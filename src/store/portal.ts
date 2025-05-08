import React, { ReactElement } from 'react';
import { create } from 'zustand';

import { PortalStore } from '@/store/types';

import { keyGenerator } from '@/utils';

/** portal 组件信息 */
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
  updateChildren: (key, props) => {
    const tmpMap = get().elements;
    const currentElement = tmpMap[key];
    if (currentElement) {
      tmpMap[key] = React.cloneElement(currentElement, props);
    }
    set({
      elements: tmpMap,
    });
    get().updateFromElements();
  },
  appendChildren: (newChildren, portalType = 'common') => {
    let tmpMap: Record<number, ReactElement> = get().elements;
    const { updateFromElements } = get();
    const key = keyGenerator.next().value as unknown as number;
    if (newChildren) {
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
    return newChildren ? key : -1;
  },
  deleteChildren: key => {
    const { elements, updateFromElements } = get();
    console.log('ele', elements);
    delete elements[key];

    updateFromElements();
  },
}));
