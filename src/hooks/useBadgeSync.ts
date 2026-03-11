import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useEvents } from '@/store/events';

import { jpushClient } from '@/utils/jpush';

const useBadgeSync = () => {
  const { feedEvents, getFeedEvents } = useEvents();

  // Fetch events on mount and app resume
  useEffect(() => {
    const fetchEvents = () => {
      getFeedEvents();
    };

    fetchEvents();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        fetchEvents();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [getFeedEvents]);

  // Sync badge count with unread events (使用极光推送)
  useEffect(() => {
    const unreadCount = feedEvents.filter(e => !e.read).length;
    jpushClient.setBadge({ badge: unreadCount, appBadge: unreadCount });
  }, [feedEvents]);
};

export default useBadgeSync;
