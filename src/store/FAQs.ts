import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { SheetItem } from '@/types/feedback';

interface FAQState {
  FAQs: SheetItem[];
  updateFAQs: (FAQs: SheetItem[]) => void;
  clearFAQs: () => void;
}

const useFAQStore = create<FAQState>()(
  persist(
    set => ({
      FAQs: [],
      updateFAQs: FAQs => set({ FAQs }),
      clearFAQs: () => set({ FAQs: [] }),
    }),
    {
      name: 'feedback-faq',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useFAQStore;
