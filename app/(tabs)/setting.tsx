import { Button, Toast } from '@ant-design/react-native';
import * as Updates from 'expo-updates';
import { FC, memo, useState, useTransition } from 'react';
import { View, Text } from 'react-native';

import fetchUpdate from '@/utils/fetchUpdates';

const SettingPage: FC = () => {
  const [isPending, startTransition] = useTransition();
  const [updates, setNewUpdates] = useState<Updates.UpdateCheckResult>();
  const handlePress = () => {
    startTransition(() => {
      fetchUpdate().then(res => {
        if (!res.isAvailable) Toast.success('已是最新版');
        setNewUpdates(res);
      }, null);
    });
  };
  console.log(isPending);
  return (
    <>
      <View>
        <Button onPress={handlePress} loading={updates?.isAvailable}>
          检查更新
        </Button>
        <Text>{JSON.stringify(updates)}</Text>
      </View>
    </>
  );
};

export default memo(SettingPage);
