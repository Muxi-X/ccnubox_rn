import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Button from '@/components/button';
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
      <Button
        style={styles.notificationBtnContainer}
        buttonStyle={[styles.notificationBtn, { backgroundColor: '#7878F8' }]}
        textStyle={{ color: commonColors.white, fontSize: 14 }}
        onPress={() => setNotiVisible(true)}
      >
        通知设置
      </Button>
      <NotiPicker visible={notiVisible} setVisible={setNotiVisible} />
      <Button
        style={styles.notificationBtnContainer}
        buttonStyle={[styles.notificationBtn, { backgroundColor: '#EBEBEB' }]}
        textStyle={{ color: '#FF6F6F', fontSize: 14 }}
        onPress={() => {
          setClearVisible(true);
        }}
      >
        一键清空
      </Button>
      <ClearModal
        clearVisible={clearVisible}
        setClearVisible={setClearVisible}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  notificationBtnContainer: {
    marginRight: 10,
    borderRadius: 10,
  },
  notificationBtn: {
    borderColor: commonColors.gray,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minHeight: 0,
  },
});

export default NotificationHeaderRight;
