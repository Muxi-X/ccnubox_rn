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
        backgroundColor="#7878F8"
        textColor={commonColors.white}
        buttonStyle={styles.notificationBtn}
        fontSize={14}
        onPress={() => setNotiVisible(true)}
      >
        通知设置
      </Button>
      <NotiPicker visible={notiVisible} setVisible={setNotiVisible} />
      <Button
        backgroundColor="#EBEBEB"
        textColor="#FF6F6F"
        buttonStyle={styles.notificationBtn}
        fontSize={14}
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
  notificationBtn: {
    borderColor: commonColors.gray,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minHeight: 0,
    marginRight: 10,
  },
});

export default NotificationHeaderRight;
