import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Button, View } from 'react-native';

export default function Setting() {
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    if (isUpdatePending) {
      void Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  return (
    <View>
      <Button onPress={() => Updates.checkForUpdateAsync()} title="检查更新" />
      {isUpdateAvailable ? (
        <Button onPress={() => Updates.fetchUpdateAsync()} title="下载并更新" />
      ) : null}
      <StatusBar style="auto" />
    </View>
  );
}
