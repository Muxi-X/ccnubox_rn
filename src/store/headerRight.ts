import { create } from 'zustand';

type HeaderRightStore = {
  content: React.ReactNode | null;
  setContent: (content: React.ReactNode | null) => void;
};

/**
 * 允许子页面向父布局的 CustomStackHeader 注入 headerRight 内容
 * 页面挂载时 setContent，卸载时 setContent(null)
 */
export const useHeaderRightStore = create<HeaderRightStore>(set => ({
  content: null,
  setContent: content => set({ content }),
}));
