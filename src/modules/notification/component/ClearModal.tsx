import type { FC } from 'react';

import Dialog from '@/components/dialog';
import Toast from '@/components/toast';
import { useEvents } from '@/store/events';

interface ClearModalProps {
  clearVisible: boolean;
  setClearVisible: (_visible: boolean) => void;
}

const ClearModal: FC<ClearModalProps> = ({ clearVisible, setClearVisible }) => {
  const { clearAllEvents } = useEvents();

  const handleClear = async () => {
    try {
      await clearAllEvents();
      Toast.success('已清空所有消息');
      setClearVisible(false);
    } catch {
      Toast.fail('清空失败，请稍后重试');
    }
  };

  return (
    <Dialog
      isVisible={clearVisible}
      title="确定要清除所有消息吗？"
      message="被清除的消息不能恢复哦，请及时查收重要信息"
      confirmText="确定"
      cancelText="取消"
      onConfirm={handleClear}
      onCancel={() => setClearVisible(false)}
      onBackdropPress={() => setClearVisible(false)}
    />
  );
};

export default ClearModal;
