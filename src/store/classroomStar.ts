import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ClassroomStarState {
  // 收藏的教室号码数组
  starredClassrooms: string[];

  // 添加收藏教室
  addStarredClassroom: (roomNumber: string) => void;

  // 取消收藏教室
  removeStarredClassroom: (roomNumber: string) => void;

  // 切换收藏状态
  toggleStarredClassroom: (roomNumber: string) => void;

  // 检查是否已收藏
  isClassroomStarred: (roomNumber: string) => boolean;

  // 清空所有收藏
  clearAllStarredClassrooms: () => void;
}

const useClassroomStarStore = create<ClassroomStarState>()(
  persist(
    (set, get) => ({
      starredClassrooms: [],

      addStarredClassroom: (roomNumber: string) => {
        const { starredClassrooms } = get();
        if (!starredClassrooms.includes(roomNumber)) {
          set({
            starredClassrooms: [...starredClassrooms, roomNumber],
          });
        }
      },

      removeStarredClassroom: (roomNumber: string) => {
        const { starredClassrooms } = get();
        set({
          starredClassrooms: starredClassrooms.filter(
            room => room !== roomNumber
          ),
        });
      },

      toggleStarredClassroom: (roomNumber: string) => {
        const {
          isClassroomStarred,
          addStarredClassroom,
          removeStarredClassroom,
        } = get();
        if (isClassroomStarred(roomNumber)) {
          removeStarredClassroom(roomNumber);
        } else {
          addStarredClassroom(roomNumber);
        }
      },

      isClassroomStarred: (roomNumber: string) => {
        const { starredClassrooms } = get();
        return starredClassrooms.includes(roomNumber);
      },

      clearAllStarredClassrooms: () => {
        set({ starredClassrooms: [] });
      },
    }),
    {
      name: 'classroom-star-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useClassroomStarStore;
