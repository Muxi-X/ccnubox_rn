import { useFocusEffect } from 'expo-router';
import { type FC, memo, useCallback, useRef, useState } from 'react';
import {
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { openPushUrl } from '@/hooks/useJPush';

import Toast from '@/components/toast';

import { type EventProps, useEvents } from '@/store/events';
import useVisualScheme from '@/store/visualScheme';

import { FeedIconList } from '@/constants/notificationItem';

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const date = new Date(timestamp * 1000);
  const diff = now - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return '昨天';
  } else if (days === 2) {
    return '前天';
  } else if (days < 7) {
    return `${days} 天前`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} 周前`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} 个月前`;
  } else {
    const years = Math.floor(days / 365);
    return `${years} 年前`;
  }
};

const NotificationPage: FC = () => {
  const currentStyles = useVisualScheme(state => state.currentStyle);
  const { feedEvents, getFeedEvents } = useEvents();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getFeedEvents();
    }, [getFeedEvents])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getFeedEvents();
    Toast.show({ icon: 'success', text: '刷新成功', duration: 1000 });
    setRefreshing(false);
  }, [getFeedEvents]);

  const sortedEvents = feedEvents ? [...feedEvents].reverse() : [];

  return (
    <View style={[{ flex: 1 }, currentStyles?.background_style]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          {sortedEvents.map(item => (
            <ListItem key={item.id} {...item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export const ListItem: FC<EventProps> = ({
  type,
  title,
  read,
  content,
  id,
  created_at,
  url,
  extend_fields,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const swipeableRef = useRef<Swipeable>(null);
  const feedIcon = FeedIconList.find(item => item.name === type);
  const { markAsRead, getFeedEvents, deleteEvent } = useEvents();

  const readEvent = () => {
    console.log('[Notification] 点击通知项:', { id, type, url, extend_fields });
    if (id) {
      markAsRead(id).then(() => {
        getFeedEvents();
      });
    }

    // 通知中心列表点击优先使用接口直出 url，避免与 JPush extras 解析逻辑混用
    const fallbackUrl = extend_fields?.url;
    const targetUrl = url || fallbackUrl;
    if (targetUrl) {
      console.log('[Notification] 发现跳转 URL:', targetUrl);
      openPushUrl(targetUrl);
    } else {
      console.log('[Notification] 未发现跳转 URL');
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteEvent(id).then(() => {
        getFeedEvents();
      });
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <Animated.View
        style={[styles.deleteAction, { transform: [{ translateX }] }]}
      >
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>删除</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (!feedIcon) return null;
  const displayTitle = title?.trim() || feedIcon.text;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
    >
      <TouchableOpacity onPress={readEvent} style={styles.listItem}>
        <View>
          <Image source={feedIcon.imageUrl} style={styles.icon} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, currentStyle?.schedule_text_style]}>
            {displayTitle}
          </Text>
          {content && (
            <Text
              style={[
                {
                  color: '#3D3D3D',
                  fontSize: 14,
                  paddingTop: 2,
                  fontWeight: '300',
                },
                currentStyle?.notification_text_style,
              ]}
            >
              {content || ''}
            </Text>
          )}
        </View>
        <View style={styles.right}>
          <View>
            <Text style={[styles.time]}>
              {created_at ? formatRelativeTime(created_at) : ''}
            </Text>
          </View>
          {!read && (
            <View style={styles.badge}>
              <Text
                style={{
                  fontSize: 10,
                  textAlign: 'center',
                  color: '#fff',
                }}
              >
                1
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  listItem: {
    width: '100%',
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 15,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  right: {
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 50,
    flexShrink: 0,
  },
  time: {
    fontSize: 10,
    color: '#949494',
    marginBottom: 4,
  },
  badge: {
    marginRight: 3,
    width: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 0,
    backgroundColor: '#FF7474',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    width: '100%',
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default memo(NotificationPage);
