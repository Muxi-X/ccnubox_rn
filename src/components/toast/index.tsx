import { View } from '@ant-design/react-native';
import { FC, useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import AnimatedScale from '@/components/animatedView/AnimatedScale';
import { ModalBack } from '@/components/modal';
import { ToastProps } from '@/components/toast/type';

import { usePortalStore } from '@/store/portal';
import useVisualScheme from '@/store/visualScheme';

import SuccessIcon from '@/assets/images/success.png';
import { commonColors, commonStyles } from '@/styles/common';

const DURATION = 400;

export const statusImage = {
  success: SuccessIcon,
};

const Toast: FC<ToastProps> & { show: (_props: ToastProps) => void } = ({
  visible: initVisible = false,
  currentKey,
  icon,
  text,
  duration = 2000,
}) => {
  const currentVisualScheme = useVisualScheme(state => state.currentStyle);
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
    const animTimer = setTimeout(() => {
      setVisible(false);
      const backTimer = setTimeout(() => {
        clearTimeout(animTimer);
        clearTimeout(backTimer);
        Promise.resolve(currentKey && deleteChildren(currentKey));
      }, DURATION * 0.8);
    }, duration);
  }, [initVisible]);
  return (
    <>
      <ModalBack visible={visible} style={{ zIndex: currentKey }}>
        <View style={[styles.modalOverlay, { zIndex: currentKey }]}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalBackground}
            onPress={handleClose}
          ></TouchableOpacity>
          <AnimatedScale
            duration={DURATION}
            outputRange={[0.2, 1]}
            trigger={visible}
            style={[
              styles.toastContent,
              currentVisualScheme?.modal_background_style,
            ]}
          >
            {icon && (
              <Image
                source={statusImage['success'] as ImageSourcePropType}
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
                { color: commonColors.darkGray, textAlign: 'center' },
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
  const appendChildren = usePortalStore.getState().appendChildren;
  appendChildren(<Toast visible={true} {...props}></Toast>);
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
