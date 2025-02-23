import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { commonColors } from '@/styles/common';

import ClearModal from './ClearModal';
import NotiPicker from './NotiPicker';

const NotificationHeaderRight = () => {
  const [notiVisible, setNotiVisible] = useState(false);
  const [clearVisible, setClearVisible] = useState(false);

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <TouchableOpacity
        style={[
          styles.notificationBtn,
          {
            backgroundColor: '#7878F8',
          },
        ]}
        onPress={() => setNotiVisible(true)}
      >
        <Text
          style={{
            color: commonColors.white,
          }}
        >
          消息通知
        </Text>
      </TouchableOpacity>
      <NotiPicker visible={notiVisible} setVisible={setNotiVisible} />
      <TouchableOpacity
        style={[
          styles.notificationBtn,
          {
            backgroundColor: '#D9D9D9',
          },
        ]}
        onPress={() => {
          setClearVisible(true);
        }}
      >
        <Text
          style={{
            color: '#FF6F6F',
          }}
        >
          一键清空
        </Text>
      </TouchableOpacity>
      <ClearModal
        clearVisible={clearVisible}
        setClearVisible={setClearVisible}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  notificationBtn: {
    borderColor: commonColors.gray,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 10,
  },
});

export default NotificationHeaderRight;
