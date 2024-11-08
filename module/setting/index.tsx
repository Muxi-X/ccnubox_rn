import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

import Button from '@/components/button';
import Picker, { basicColumns } from '@/components/picker';
import Toast from '@/components/toast';
import useVisualScheme from '@/store/visualScheme';

export default function SettingPage() {
  const { currentStyle, currentComponents, themeName, changeTheme } =
    useVisualScheme(
      ({ currentStyle, currentComponents, changeTheme, themeName }) => ({
        currentStyle,
        changeTheme,
        currentComponents,
        themeName,
      })
    );
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (isUpdatePending) {
      void Updates.reloadAsync();
    }
  }, [isUpdatePending]);
  useEffect(() => {
    // Modal.show({
    //   title: '检测到更新',
    //   children: '是否更新',
    //   onConfirm: () => {
    //     Updates.fetchUpdateAsync();
    //   },
    // });
  }, [isUpdateAvailable]);

  return (
    <View style={[{ flex: 1 }, currentStyle?.background_style]}>
      <Button
        style={[currentStyle?.button_style, { width: '100%' }]}
        onPress={() => {
          changeTheme(themeName === 'dark' ? 'light' : 'dark');
        }}
      >
        切换模式
      </Button>
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
      <Picker>
        <Text>345345</Text>
      </Picker>
    </View>
  );
}
