import React, { FC, memo, useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// import Skeleton from '@/components/skeleton';
import useVisualScheme from '@/store/visualScheme';

import queryFeedEvents from '@/request/api/queryFeedEvents';
// import saveFeedToken from '@/request/api/saveFeedToken';

interface ExtendFields {
  test: string;
}
interface EventProps {
  content: string;
  created_at: number; // Unix 时间戳
  extend_fields: ExtendFields;
  id: number;
  title: string;
  type: string;
}
interface EventListProps {
  read: EventProps[];
  unread: EventProps[];
}
interface FeedIconProps {
  label: string;
  icon: ImageSourcePropType;
  title: string;
  content: EventListProps;
}

const NotificationPage: FC = () => {
  // const [loading, setLoading] = useState<boolean>(true);
  const currentStyles = useVisualScheme(state => state.currentStyle);

  const [feedIcon, setFeedIcon] = useState<FeedIconProps[]>([
    // {
    //   label: 'class',
    //   icon: require('@/assets/images/noti-class.png'),
    //   title: '上课',
    // },
    {
      label: 'grade',
      icon: require('@/assets/images/a-grade.png'),
      title: '成绩',
      content: {
        read: [],
        unread: [],
      },
    },
    {
      label: 'muxi',
      icon: require('@/assets/images/a-muxi.png'),
      title: '木犀官方',
      content: {
        read: [],
        unread: [],
      },
    },
    {
      label: 'holiday',
      icon: require('@/assets/images/a-holiday.png'),
      title: '假期临近',
      content: {
        read: [],
        unread: [],
      },
    },
    {
      label: 'air_conditioner',
      icon: require('@/assets/images/a-air.png'),
      title: '空调电费告急',
      content: {
        read: [],
        unread: [],
      },
    },
    {
      label: 'light',
      icon: require('@/assets/images/a-light.png'),
      title: '照明电费告急',
      content: {
        read: [],
        unread: [],
      },
    },
  ]);

  useEffect(() => {
    queryFeedEvents().then((res?: { [key: string]: EventListProps }) => {
      console.log('res', res);
      setFeedIcon(prev => {
        return prev.map(item => {
          if (res?.[item.label] && typeof res[item.label] === 'object') {
            const content = { ...res[item.label] };
            content.read = content.read ? content.read.reverse() : [];
            content.unread = content.unread ? content.unread.reverse() : [];
            return { ...item, content };
          }
          return item;
        });
      });
    });

    // const token = saveFeedToken().then(res => {

    // });
    // console.log('res', res);
  }, []);

  //监听feed
  useEffect(() => {
    console.log('Updated feedIcon:', feedIcon);
  }, [feedIcon]);
  return (
    <View style={[{ flex: 1 }, currentStyles?.background_style]}>
      {/* <Skeleton loading={loading}> */}
      <View>
        {feedIcon.map((item, index) => (
          <ListItem key={index} {...item} />
        ))}
      </View>
      {/* </Skeleton> */}
    </View>
  );
};

export const ListItem: FC<FeedIconProps> = ({
  // label,
  icon,
  title,
  content,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <TouchableOpacity style={styles.listItem}>
      <View>
        <Image source={icon} style={styles.icon} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, currentStyle?.schedule_text_style]}>
          {title}提醒
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
            {content.unread[0]?.content || content.read[0]?.content || ''}
          </Text>
        )}
      </View>
      <View style={styles.right}>
        {content && (
          <View>
            <Text style={[styles.time]}>
              {content.unread[0]?.created_at
                ? new Date(
                    content.unread[0]?.created_at * 1000
                  ).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : content.read[0]?.created_at
                  ? new Date(
                      content.read[0]?.created_at * 1000
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''}
            </Text>
          </View>
        )}
        {content.unread.length > 0 && (
          <View style={styles.badge}>
            <Text
              style={{
                fontSize: 10,
                textAlign: 'center',
                color: '#fff',
              }}
            >
              {content.unread.length > 99 ? '99+' : content.unread.length}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    width: 20,
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
