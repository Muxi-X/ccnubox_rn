import { View } from '@ant-design/react-native';
import React, { FC, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, Image } from 'react-native';

import AnimatedScale from '@/components/animatedView/AnimatedScale';
import { ModalBack } from '@/components/modal';
import { ToastProps } from '@/components/toast/type';
import { statusImage } from '@/constants/toast';
import { usePortalStore } from '@/store/portal';
import useVisualScheme from '@/store/visualScheme';
import { commonColors, commonStyles } from '@/styles/common';

const Toast: FC<ToastProps> & { show: (props: ToastProps) => void } = ({
  visible: initVisible = false,
  currentKey,
  icon,
  text,
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
            {icon && (
              <Image
                source={statusImage['success']}
                style={{
                  margin: 10,
                  borderRadius: 15,
                  width: 100,
                  height: 100,
                  marginBottom: 20,
                }}
              ></Image>
            )}
            <Text
              style={[
                useVisualScheme.getState().currentStyle?.text_style,
                commonStyles.fontLarge,
                { color: commonColors.darkGray },
              ]}
            >
              {text}
            </Text>
          </AnimatedScale>
        </View>
      </ModalBack>
    </>
  );
};
Toast.show = (props: ToastProps) => {
  const updateChildren = usePortalStore.getState().updateChildren;
  updateChildren(<Toast visible={true} {...props}></Toast>);
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
    borderRadius: 10,
    margin: 20,
    width: 220,
    // height: 180,
    marginBottom: 10,
    padding: 30,
    shadowColor: '#000',
    backgroundColor: '#fff',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
