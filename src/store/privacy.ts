import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PrivacyState {
  agreement: boolean;
  setAgreement: (_agreement: boolean) => void;
}

const usePrivacy = create<PrivacyState>()(
  persist(
    set => {
      return {
        agreement: false,
        setAgreement: (agreement: boolean) => set({ agreement }),
      };
    },
    {
      name: 'agreement',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default usePrivacy;
