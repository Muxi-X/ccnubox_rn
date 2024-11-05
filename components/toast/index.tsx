import { View } from '@ant-design/react-native';
import React, { FC, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import AnimatedScale from '@/components/animatedView/AnimatedScale';
import { ModalBack } from '@/components/modal';
import { ToastProps } from '@/components/toast/type';
import { usePortalStore } from '@/store/portal';

const Toast: FC<ToastProps> & { show: () => void } = ({
  visible: initVisible = false,
  currentKey,
  icon,
}) => {
  const [visible, setVisible] = useState<boolean>(initVisible);
  const deleteChildren = usePortalStore(state => state.deleteChildren);
  const handleClose = () => {
    setVisible(false);
  };
  useEffect(() => {
    setVisible(initVisible);
    // FIX_ME: 与 Modal 同样
    // 没有动画结束监听函数
    // 目前是定时删除
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        currentKey && deleteChildren(currentKey);
      }, 1000);
    }, 2000);
  }, [initVisible]);
  return (
    <>
      <ModalBack visible={visible} style={{ zIndex: currentKey }}>
        <View
          style={[
            styles.modalOverlay,
            { elevation: currentKey, zIndex: currentKey },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalBackground}
            onPress={handleClose}
          ></TouchableOpacity>
          <AnimatedScale
            duration={400}
            outputRange={[0.6, 1]}
            trigger={visible}
            style={styles.toastContent}
          >
            <View
              style={{ height: 200, width: 200, backgroundColor: '#000' }}
            ></View>
          </AnimatedScale>
        </View>
      </ModalBack>
    </>
  );
};
Toast.show = () => {
  const updateChildren = usePortalStore.getState().updateChildren;
  updateChildren(<Toast visible={true}></Toast>);
};
export default Toast;

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  toastContent: {
    borderRadius: 20,
    margin: 20,
    marginBottom: 10,
    shadowColor: '#000',
    backgroundColor: '#fff',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    display: 'flex',
    overflow: 'hidden',
  },
});
