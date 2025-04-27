import { getItem } from 'expo-secure-store';
import React, { FC, memo, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import useJPush from '@/hooks/useJPush';

import { EventProps, useEvents } from '@/store/events';
// import { useJPush } from '@/hooks';
import useVisualScheme from '@/store/visualScheme';

import { FeedIconList } from '@/constants/notificationItem';
import { saveFeedToken } from '@/request/api/feeds';

const NotificationPage: FC = () => {
  const currentStyles = useVisualScheme(state => state.currentStyle);

  const { feedEvents, getFeedEvents } = useEvents();
  const [pushToken, setPushToken] = useState<string | null | undefined>();

  useJPush();

  const fetchToken = async () => {
    const token = await getItem('pushToken');
    //console.log(token);
    setPushToken(token);
  };

  const getEvents = () => {
    getFeedEvents();
  };

  useEffect(() => {
    getEvents();
    fetchToken();
  }, []);

  useEffect(() => {
    if (pushToken) {
      //console.log(pushToken);

      saveFeedToken(pushToken);
    }
  }, [pushToken]);

  return (
    <View style={[{ flex: 1 }, currentStyles?.background_style]}>
      <View>
        {feedEvents.map((item, index) => (
          <ListItem key={index} {...item} />
        ))}
      </View>
    </View>
  );
};

export const ListItem: FC<EventProps> = ({
  type,
  read,
  content,
  id,
  created_at,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  const feedIcon = FeedIconList.find(item => item.name === type);

  const { markAsRead, getFeedEvents } = useEvents();

  const readEvent = () => {
    if (id) {
      markAsRead(id).then(() => {
        getFeedEvents();
      });
    }
  };

  if (!feedIcon) return null;

  return (
    <TouchableOpacity onPress={readEvent} style={styles.listItem}>
      <View>
        <Image source={feedIcon.imageUrl} style={styles.icon} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, currentStyle?.schedule_text_style]}>
          {feedIcon.text}提醒
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
            {created_at
              ? new Date(created_at * 1000).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
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
  );
};

const styles = StyleSheet.create({
  skeletonWrapper: {
    flex: 1,
    marginTop: 20,
  },
  skeletonItem: {
    marginBottom: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skeletonIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonText: {
    width: 120,
    height: 12,
    backgroundColor: '#e0e0e0',
    marginLeft: 10,
    borderRadius: 4,
  },
  listItem: {
    width: '100%',
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 10,
    position: 'relative',
    color: '#949494',
    paddingBottom: 5,
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
});

export default memo(NotificationPage);
