import { create } from 'zustand';

import { scraperType } from '@/store/types';

const useScraper = create<scraperType>((set, get) => ({
  ref: null,
  setRef: newRef => set(() => ({ ref: newRef ?? null })),
  injectJavaScript: (injected: string) => {
    const { ref } = get();
    ref?.current && ref.current.injectJavaScript(injected);
  },
}));

export default useScraper;
