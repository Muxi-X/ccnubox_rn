import { Switch } from '@ant-design/react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FC, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import { FeedIconList } from '@/constants/notificationItem';
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
  const [checkList, setCheckList] = useState<Record<string, boolean>>({
    muxi: true,
    grade: true,
    holiday: true,
    air_conditioner: true,
    light: true,
  });
  const feedIcon = FeedIconList;

  const getFeedList = () => {
    queryFeedAllowList().then(res => {
      const data = { ...res };
      // console.log('getlist', res);
      if (data)
        setCheckList({
          air_conditioner: data?.air_conditioner || false,
          grade: data?.grade || false,
          holiday: data?.holiday || false,
          light: data?.light || false,
          muxi: data?.muxi || false,
        });
      // console.log('update', updateFeedIcon);
    });
  };

  useEffect(() => {
    getFeedList();
  }, []);

  const handleConfirm = () => {
    const data = checkList;
    // console.log('data', data);
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
              onPress={() => {
                setVisible(false);
              }}
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
                <Image source={item.imageUrl} style={styles.icon} />
              </View>
              <View style={styles.content}>
                <Text style={[styles.title, currentStyle?.schedule_text_style]}>
                  {item.text}提醒
                </Text>
              </View>
              <View style={styles.right}>
                <Switch
                  checked={!!checkList[item.name]}
                  style={[{ width: 40, height: 20, marginRight: 10 }]}
                  trackColor={{ false: '#ECEBFF', true: '#C9B7FF' }}
                  thumbColor="#979797"
                  onChange={() => {
                    setCheckList(prev => ({
                      ...prev,
                      [item.name]: !prev[item.name],
                    }));
                  }}
                />
              </View>
            </View>
          ))}
          <View
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              },
              currentStyle?.background_style,
            ]}
          >
            <TouchableHighlight style={[styles.button]} onPress={handleConfirm}>
              <Text
                style={[
                  {
                    color: '#FFFFFF',
                    fontSize: 16,
                  },
                ]}
              >
                确认
              </Text>
            </TouchableHighlight>
          </View>
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
  button: {
    backgroundColor: '#7B70F1',
    width: 150,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
});

export default NotiPicker;
