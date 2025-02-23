import { Switch } from '@ant-design/react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FC, useEffect, useState } from 'react';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import changeFeedAllowList from '@/request/api/changeFeedAllowList';
import queryFeedAllowList from '@/request/api/queryFeedAllowList';
interface NotiPickerProps {
  visible: boolean;
  setVisible: (_visible: boolean) => void;
  // onCancel?: () => void;
  // onConfirm?: (type: string) => void;
}

const NotiPicker: FC<NotiPickerProps> = ({
  visible,
  setVisible,
  // onCancel,
  // onConfirm,
}) => {
  const [feedIcon, setFeedIcon] = useState([
    // {
    //   label: 'class',
    //   icon: require('@/assets/images/noti-class.png'),
    //   title: '上课',
    //   check: true,
    // },
    {
      label: 'grade',
      icon: require('@/assets/images/a-grade.png'),
      title: '成绩',
      check: true,
    },
    {
      label: 'muxi',
      icon: require('@/assets/images/a-muxi.png'),
      title: '木犀官方',
      check: true,
    },
    {
      label: 'holiday',
      icon: require('@/assets/images/a-holiday.png'),
      title: '假期临近',
      check: true,
    },
    {
      label: 'air_conditioner',
      icon: require('@/assets/images/a-air.png'),
      title: '空调电费告急',
      check: true,
    },
    {
      label: 'light',
      icon: require('@/assets/images/a-light.png'),
      title: '照明电费告急',
      check: false,
    },
  ]);

  const getFeedList = () =>{
    queryFeedAllowList().then(res => {
      // console.log('getlist', res);
      const updateFeedIcon = feedIcon.map(item => {
        if (res?.[item.label] !== undefined) {
          return { ...item, check: res?.[item.label] };
        }
        return item;
      });

      // console.log('update', updateFeedIcon);
      setFeedIcon(updateFeedIcon);
    });
  };

  useEffect(() => {
    getFeedList();
  }, []);

  const handleClose = () => {
    const data = feedIcon.reduce((acc, item) => {
      acc[item.label] = item.check;
      return acc;
    }, {});
    console.log('data', data);
    changeFeedAllowList(data).then(() => {
      getFeedList();
    });
    setVisible(false);
  };

  const currentStyle = useVisualScheme(state => state.currentStyle);

  return (
    <Modal visible={visible} transparent={true}>
      <View
        style={[
          {
            flex: 1,
            backgroundColor: 'rgba(151, 151, 151, 0.42)',
          },
        ]}
      >
        <View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              width: '100%', // 确保宽度占满
            },
          ]}
        >
          <View
            style={[
              {
                paddingVertical: 16,
              },
              currentStyle?.background_style,
            ]}
          >
            <View>
              <Text
                style={[
                  { textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
                  currentStyle?.schedule_text_style,
                ]}
              >
                请选择要推送的消息
              </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
              <Text
                style={[
                  { textAlign: 'center', fontSize: 14 },
                  currentStyle?.notification_text_style,
                ]}
              >
                选择以后将为您推送以下消息
              </Text>
            </View>
          </View>
          <View
            style={[
              {
                position: 'absolute',
                right: 5,
                top: 5,
              },
              currentStyle?.background_style,
            ]}
          >
            <MaterialIcons
              name="close"
              color={currentStyle?.schedule_text_style?.color}
              size={24}
              onPress={handleClose}
            ></MaterialIcons>
          </View>
          {feedIcon.map((item, index) => (
            <View
              style={[
                {
                  display: 'flex',
                  flexDirection: 'row',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                },
                currentStyle?.background_style,
              ]}
              key={index}
            >
              <View>
                <Image source={item.icon} style={styles.icon} />
              </View>
              <View style={styles.content}>
                <Text style={[styles.title, currentStyle?.schedule_text_style]}>
                  {item.title}提醒
                </Text>
              </View>
              <View style={styles.right}>
                <Switch
                  checked={item.check}
                  style={[{ width: 40, height: 20, marginRight: 10 }]}
                  trackColor={{ false: '#ECEBFF', true: '#C9B7FF' }}
                  thumbColor="#979797"
                  onChange={() => {
                    setFeedIcon(prev => {
                      return prev.map(feed => {
                        if (feed.label === item.label) {
                          return { ...feed, check: !feed.check };
                        }
                        return feed;
                      });
                    });
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </Modal>
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
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 0,
    backgroundColor: '#FF7474',
  },
});

export default NotiPicker;
