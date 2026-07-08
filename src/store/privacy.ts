import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PrivacyState {
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  agreement: boolean;
  setAgreement: (_agreement: boolean) => void;
}

const usePrivacy = create<PrivacyState>()(
  persist(
    set => {
      return {
        hydrated: false,
        setHydrated: (hydrated: boolean) => set({ hydrated }),
        agreement: false,
        setAgreement: (agreement: boolean) => set({ agreement }),
      };
    },
    {
      name: 'agreement',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: state => {
        return () => {
          state?.setHydrated(true);
        };
      },
    }
  )
);

export default usePrivacy;
