 
import { create } from 'zustand';

import { queryFeedEvents, readFeedEvent } from '@/request/api/feeds';

interface ExtendFields {
  test?: string;
}

export interface EventProps {
  content?: string;
  created_at?: number; // Unix 时间戳
  extend_fields?: ExtendFields;
  id?: number;
  title?: string;
  type?: string;
  read?: boolean;
}

// 创建 zustand store
export const useEvents = create<{
  feedEvents: EventProps[];
  setFeedEvents: (newEvents: EventProps[]) => void;
  markAsRead: (id: number) => Promise<void>;
  getFeedEvents: () => void;
}>(set => ({
  feedEvents: [], // 初始数据为空数组
  setFeedEvents: newEvents => set({ feedEvents: newEvents }), // 设置事件列表
  markAsRead: async id => {
    await readFeedEvent(id);
  },
  getFeedEvents: () => {
    queryFeedEvents().then(res => {
      if (res) {
        const newres = [...res];
        set({ feedEvents: newres });
      }
    });
  },
}));
