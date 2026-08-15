import { View } from '@ant-design/react-native';
import { FC, useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import SuccessIcon from '@/assets/images/success.png';
import AnimatedScale from '@/components/animatedView/AnimatedScale';
import { ModalBack } from '@/components/modal';
import { ToastProps } from '@/components/toast/type';
import { usePortalStore } from '@/store/portal';
import useVisualScheme from '@/store/visualScheme';
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
    if (!initVisible) return;
    let backTimer: ReturnType<typeof setTimeout> | undefined;
    const animTimer = setTimeout(() => {
      setVisible(false);
      backTimer = setTimeout(() => {
        if (currentKey !== undefined) {
          deleteChildren(currentKey);
        }
      }, DURATION * 0.8);
    }, duration);
    return () => {
      clearTimeout(animTimer);
      if (backTimer) clearTimeout(backTimer);
    };
  }, [initVisible, currentKey, duration, deleteChildren]);
  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => {
        if (currentKey !== undefined) {
          deleteChildren(currentKey);
        }
      }, DURATION * 0.8);
      return () => clearTimeout(timer);
    }
  }, [visible, currentKey, deleteChildren]);
  return (
    <>
      <ModalBack visible={visible} style={{ zIndex: currentKey }}>
        <View
          pointerEvents={visible ? 'auto' : 'none'}
          style={[styles.modalOverlay, { zIndex: currentKey }]}
        >
          <Pressable
            style={[StyleSheet.absoluteFill, styles.modalBackground]}
            onPress={handleClose}
          />
          <AnimatedScale
            duration={DURATION}
            outputRange={[0.2, 1]}
            trigger={visible}
            onStartShouldSetResponder={() => true}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  toastContent: {
    borderRadius: 10,
    margin: 20,
    width: 220,
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
