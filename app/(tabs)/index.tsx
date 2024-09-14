import { Button } from '@ant-design/react-native';
import { useRouter } from 'expo-router';
import { FC, memo } from 'react';
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
          // registerNotification().then(null, null);
          router.push('/login');
        }}
      >
        通知测试
      </Button>
    </View>
  );
};

export default memo(IndexPage);
