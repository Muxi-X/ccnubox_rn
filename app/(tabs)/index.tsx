import { Button } from '@ant-design/react-native';
import { useRouter } from 'expo-router';
import React, { FC, memo } from 'react';
import { Text, View } from 'react-native';

import useNotification from '@/hooks/useNotification';

const IndexPage: FC = () => {
  const [notification, registerNotification] = useNotification();
  const router = useRouter();
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
    </View>
  );
};

export default memo(IndexPage);
