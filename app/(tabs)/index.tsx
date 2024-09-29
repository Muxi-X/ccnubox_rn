import { Button } from '@ant-design/react-native';
import { useRouter } from 'expo-router';
import React, { FC, memo, useState } from 'react';
import { Text, View } from 'react-native';

import BottomModal from '@/components/modal';
import useNotification from '@/hooks/useNotification';

const IndexPage: FC = () => {
  const [notification, registerNotification] = useNotification();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  return (
    <View>
      <Text>Hello Index😎</Text>
      <Button
        onPress={() => {
          router.push('/auth/guide/');
        }}
      >
        前往登陆页面测试
      </Button>
      <Button
        loading={!notification}
        onPress={() => {
          registerNotification().then(null, null);
        }}
      >
        通知测试
      </Button>
      <Button onPress={() => openModal()}>modal测试</Button>
      <Button
        onPress={() => {
          router.push('/webview');
        }}
      >
        webview测试
      </Button>
      <BottomModal visible={modalVisible} onClose={closeModal}>
        <Text>This is a bottom modal!</Text>
      </BottomModal>
    </View>
  );
};

export default memo(IndexPage);
