import * as Updates from 'expo-updates';
import { StyleSheet, Text, View } from 'react-native';

import updateInfo from '../assets/data/updateInfo.json';

/* 获取更新信息 */
// export const getUpdateInfo = async () => {
//   require('../../src/assets/data/updateInfo.json').default; // 确保返回的是默认导出的内容
// };

/* 显示更新模态框 */
const showUpdateModal = async (updateInfo: any) => {
  // 动态导入 Modal 组件，避免循环依赖
  //目前采用了这种很逆天的加载格式因为modal和visualScheme耦合度过高导致的 后期重构
  const { default: Modal } = await import('@/components/modal');

  Modal.show({
    confirmText: '更新',
    mode: 'middle',
    onConfirm: async () => {
      try {
        const res = await Updates.fetchUpdateAsync();
        if (res.isNew) {
          alert('更新成功，即将重启应用');
          await Updates.reloadAsync();
        } else {
          alert('没有新更新');
        }
      } catch (error) {
        alert('更新失败，请稍后重试');
      }
    },
    children: (
      <View style={styles.modalContent}>
        <Text style={styles.modalText}>
          发现最新版本 {updateInfo?.version}, 是否更新应用？
        </Text>
      </View>
    ),
  });
};

/* 检查并应用更新 */
const fetchUpdate = async () => {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      // showUpdateModal(updateInfo);
      Updates.fetchUpdateAsync().then(_r => {});
      return updateInfo;
    }
  } catch (error) {
    // console.error('检查更新失败:', error);
    // 动态导入 Modal 组件，避免循环依赖
    const { default: Modal } = await import('@/components/modal');

    Modal.show({
      title: '更新失败',
      children: '无法检查更新，请检查网络连接或稍后再试.',
      mode: 'middle',
    });
  }
};

export default fetchUpdate;

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 20,
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
