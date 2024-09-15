import { Modal } from '@ant-design/react-native';
import * as Updates from 'expo-updates';

async function fetchUpdate() {
  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    Modal.alert('有新的发布', '是否更新', [
      {
        text: '更新',
        onPress: async () => {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        },
      },
      {
        text: '取消',
        onPress: () => {
          console.log('用户取消更新');
        },
      },
    ]);
  }
  return update;
}

export default fetchUpdate;
