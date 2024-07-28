import { Button } from '@ant-design/react-native';
import { FC, memo } from 'react';
import { Text, View } from 'react-native';

import useNotification from '@/hooks/useNotification';
import useVisualScheme from '@/store/visualScheme';

const IndexPage: FC = () => {
  const [notification, registerNotification] = useNotification();
  const styles = useVisualScheme(state => state.currentStyle);
  return (
    <View className="text-red-400 flex-1 flex flex-row justify-center">
      <Text className="">Hello Index😎</Text>
      <Button
        onPress={() => {
          registerNotification();
        }}
      >
        通知测试
      </Button>
    </View>
  );
};

export default memo(IndexPage);
