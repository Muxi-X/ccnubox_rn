import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserState {
  student_id: string;
  password: string;
  setStudentId: (student_id: string) => void;
  setPassword: (password: string) => void;
}

const SecureStorage = {
  ...SecureStore,
  removeItem: SecureStore.deleteItemAsync,
};

const useUserStore = create<UserState>()(
  persist(
    set => {
      return {
        student_id: '',
        password: '',
        setStudentId: (student_id: string) => set({ student_id }),
        setPassword: (password: string) => set({ password }),
      };
    },
    {
      name: 'user',
      storage: createJSONStorage(() => SecureStorage),
    }
  )
);

export default useUserStore;
