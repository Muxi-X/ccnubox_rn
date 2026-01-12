import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useEvents } from '@/store/events';

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

  // Sync badge count with unread events
  useEffect(() => {
    const unreadCount = feedEvents.filter(e => !e.read).length;
    Notifications.setBadgeCountAsync(unreadCount).catch(console.error);
  }, [feedEvents]);
};

export default useBadgeSync;
