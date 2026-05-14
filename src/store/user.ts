import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { secureStorage } from '@/platform/storage';

interface UserState {
  student_id: string;
  password: string;
  setStudentId: (student_id: string) => void;
  setPassword: (password: string) => void;
}

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
      storage: createJSONStorage(() => secureStorage),
    }
  )
);

export default useUserStore;
