import { Modal } from '@ant-design/react-native';
import * as Updates from 'expo-updates';

import updateInfo from '../assets/data/updateInfo.json';
/* 获取更新信息 */
// export const getUpdateInfo = async () => {
//   require('../../src/assets/data/updateInfo.json').default; // 确保返回的是默认导出的内容
// };

/* 显示更新模态框 */
const showUpdateModal = (updateInfo: any) => {
  Modal.alert('有新的发布', `是否更新: ${updateInfo.version}`, [
    {
      text: '更新',
      onPress: async () => {
        try {
          const res = await Updates.fetchUpdateAsync();
          if (res.isNew) {
            alert('更新成功，即将重启应用');
            await Updates.reloadAsync();
          } else {
            alert('更新失败，请稍后重试');
          }
        } catch (error) {
          // console.error('应用更新失败:', error);
          alert('更新失败，请稍后重试');
        }
      },
    },
    {
      text: '取消',
      onPress: () => {
        // console.log('用户取消更新');
      },
    },
  ]);
};

/* 检查并应用更新 */
const fetchUpdate = async () => {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      showUpdateModal(updateInfo);
      return updateInfo;
    }
  } catch (error) {
    // console.error('检查更新失败:', error);
    Modal.alert('更新失败', '无法检查更新，请检查网络连接或稍后再试。');
  }
};

export default fetchUpdate;
