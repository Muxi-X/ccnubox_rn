import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import Button from '@/components/button';
import Toast from '@/components/toast';
import useVisualScheme from '@/store/visualScheme';

export default function SettingPage() {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (isUpdatePending) {
      void Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  return (
    <View>
      <Button
        style={[currentStyle?.button_style, { width: '100%' }]}
        onPress={() => {
          setLoading(true);
          Updates.checkForUpdateAsync()
            .then(res => {
              if (!res.isAvailable) {
                Toast.show({ text: '已是最新版', icon: 'success' });
              }
            })
            .catch(err => {
              Toast.show({ text: '我是谁' });
            })
            .finally(() => {
              setLoading(false);
            });
        }}
        isLoading={loading}
        children="检查更新"
      />
      {isUpdateAvailable ? (
        <Button
          onPress={() => Updates.fetchUpdateAsync()}
          children="下载并更新"
        />
      ) : null}
      <StatusBar style="auto" />
    </View>
  );
}
