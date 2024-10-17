import { Button } from '@ant-design/react-native';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function Setting() {
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
        onPress={() => {
          setLoading(true);
          Updates.checkForUpdateAsync()
            .then(res => {
              if (!res.isAvailable) {
                alert('已是最新版');
              }
            })
            .catch(err => {
              alert(err);
            })
            .finally(() => {
              setLoading(false);
            });
        }}
        loading={loading}
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
