import { create } from 'zustand';

import {
  clearFeedEvents,
  deleteFeedEvent,
  queryFeedEvents,
  readFeedEvent,
} from '@/request/api/feeds';

interface ExtendFields {
  test?: string;
  url?: string;
}

export interface EventProps {
  content?: string;
  created_at?: number; // Unix 时间戳
  extend_fields?: ExtendFields;
  id?: number;
  url?: string;
  title?: string;
  type?: string;
  read?: boolean;
}

// 创建 zustand store
export const useEvents = create<{
  feedEvents: EventProps[];
  setFeedEvents: (newEvents: EventProps[]) => void;
  markAsRead: (id: number) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  clearAllEvents: () => Promise<void>;
  getFeedEvents: () => Promise<void>;
}>(set => ({
  feedEvents: [], // 初始数据为空数组
  setFeedEvents: newEvents => set({ feedEvents: newEvents }), // 设置事件列表
  markAsRead: async id => {
    await readFeedEvent(id);
  },
  deleteEvent: async id => {
    await deleteFeedEvent(id);
  },
  clearAllEvents: async () => {
    const res = await clearFeedEvents();
    console.log('clear', res);
    set({ feedEvents: [] });
  },
  getFeedEvents: async () => {
    const res = await queryFeedEvents();
    if (res) {
      set({ feedEvents: res.data?.feed_events || [] });
    }
  },
}));
