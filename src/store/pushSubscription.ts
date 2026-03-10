import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PushSubscriptionState {
  hydrated: boolean;
  enabled: boolean;
  promptShown: boolean;
  registeredToken: string | null;
  setHydrated: (hydrated: boolean) => void;
  setEnabled: (enabled: boolean) => void;
  setPromptShown: (shown: boolean) => void;
  setRegisteredToken: (token: string | null) => void;
}

const usePushSubscriptionStore = create<PushSubscriptionState>()(
  persist(
    set => ({
      hydrated: false,
      enabled: false,
      promptShown: false,
      registeredToken: null,
      setHydrated: hydrated => set({ hydrated }),
      setEnabled: enabled => set({ enabled }),
      setPromptShown: promptShown => set({ promptShown }),
      setRegisteredToken: registeredToken => set({ registeredToken }),
    }),
    {
      name: 'push-subscription',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: state => {
        return () => {
          state?.setHydrated(true);
        };
      },
    }
  )
);

export default usePushSubscriptionStore;
