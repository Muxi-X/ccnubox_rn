import Toast from '@/components/toast';
import { FeedIconList } from '@/constants/notificationItem';
import changeFeedAllowList from '@/request/api/feeds/changeFeedAllowList';
import queryFeedAllowList from '@/request/api/feeds/queryFeedAllowList';
import useVisualScheme from '@/store/visualScheme';
import { Switch } from '@ant-design/react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { type FC, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

interface NotiPickerProps {
  visible: boolean;
  setVisible: (_visible: boolean) => void;
}

const NotiPicker: FC<NotiPickerProps> = ({ visible, setVisible }) => {
  const [checkList, setCheckList] = useState<Record<string, boolean>>({
    muxi: true,
    grade: true,
    holiday: true,
    energy: true,
    feedback: true,
  });
  const [loading, setLoading] = useState(false);
  const currentStyle = useVisualScheme(state => state.currentStyle);

  // 只在 modal 打开时获取数据
  useEffect(() => {
    if (visible) {
      queryFeedAllowList().then(res => {
        const data = res?.data;
        if (data) {
          setCheckList({
            energy: data?.energy ?? true,
            grade: data?.grade ?? true,
            holiday: data?.holiday ?? true,
            muxi: data?.muxi ?? true,
            feedback: data?.feed_back ?? true,
          });
        }
      });
    }
  }, [visible]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await changeFeedAllowList(checkList);
      Toast.show({ icon: 'success', text: '修改成功' });
    } finally {
      setLoading(false);
      setVisible(false);
    }
  };

  const handleToggle = (name: string) => {
    setCheckList(prev => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <Modal visible={visible} transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.header, currentStyle?.background_style]}>
            <Text
              style={[styles.headerTitle, currentStyle?.schedule_text_style]}
            >
              请选择要推送的消息
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                currentStyle?.notification_text_style,
              ]}
            >
              选择以后将为您推送以下消息
            </Text>
            <MaterialIcons
              name="close"
              color={currentStyle?.schedule_text_style?.color}
              size={24}
              style={styles.closeIcon}
              onPress={() => setVisible(false)}
            />
          </View>

          {FeedIconList.map(item => (
            <View
              style={[styles.listItem, currentStyle?.background_style]}
              key={item.name}
            >
              <Image source={item.imageUrl} style={styles.icon} />
              <View style={styles.content}>
                <Text style={[styles.title, currentStyle?.schedule_text_style]}>
                  {item.text}提醒
                </Text>
              </View>
              <Switch
                checked={!!checkList[item.name]}
                style={styles.switch}
                trackColor={{ false: '#ECEBFF', true: '#C9B7FF' }}
                thumbColor="#979797"
                onChange={() => handleToggle(item.name)}
              />
            </View>
          ))}

          <View style={[styles.footer, currentStyle?.background_style]}>
            <TouchableHighlight
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? '保存中...' : '确认'}
              </Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(151, 151, 151, 0.42)',
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
  },
  header: {
    paddingVertical: 16,
    position: 'relative',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    paddingTop: 10,
  },
  closeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 15,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  switch: {
    width: 40,
    height: 20,
    marginRight: 10,
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#7B70F1',
    width: 150,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default NotiPicker;
