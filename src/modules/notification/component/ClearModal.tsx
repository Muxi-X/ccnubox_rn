import { FC } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useEvents } from '@/store/events';
import useVisualScheme from '@/store/visualScheme';

import { clearFeedEvents } from '@/request/api/feeds';

interface ClearModalProps {
  // feedId: number;
  clearVisible: boolean;
  setClearVisible: (_visible: boolean) => void;
}

const ClearModal: FC<ClearModalProps> = ({
  // feedId,
  clearVisible,
  setClearVisible,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const { getFeedEvents } = useEvents();

  const handleClear = () => {
    clearFeedEvents().then(() => {
      getFeedEvents();
    });

    setClearVisible(false);
  };

  return (
    <Modal visible={clearVisible} transparent={true}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={[styles.container, currentStyle?.background_style]}>
          <View>
            <Text style={[styles.title, currentStyle?.schedule_text_style]}>
              确定要清除所有消息吗？
            </Text>
          </View>
          <View>
            <Text style={[styles.content, currentStyle?.schedule_text_style]}>
              被清除的消息不能恢复哦，请及时查收重要信息
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setClearVisible(false);
              }}
            >
              <Text
                style={[
                  styles.button,
                  {
                    backgroundColor: '#CECECE',
                  },
                ]}
              >
                取消
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClear}>
              <Text
                style={[
                  styles.button,
                  {
                    backgroundColor: '#7878F8',
                  },
                ]}
              >
                确定
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
export default ClearModal;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    borderRadius: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    fontSize: 15,
    marginVertical: 15,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 20,
    marginHorizontal: 30,
    color: '#fff',
  },
});
