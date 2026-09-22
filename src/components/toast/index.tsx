import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Overlay } from '@rneui/themed';
import React, { FC, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import SuccessIcon from '@/assets/images/success.png';
import { ToastProps } from '@/components/toast/type';
import { usePortalStore } from '@/store/portal';
import useVisualScheme from '@/store/visualScheme';
import { commonColors, commonStyles } from '@/styles/common';

const normalizeDuration = (dur?: number): number => {
  if (dur === undefined) return 2000;
  if (dur === 0) return 0;
  return dur < 50 ? dur * 1000 : dur;
};

const Toast: FC<ToastProps> & {
  show: (_props: ToastProps | string, _duration?: number) => void;
  success: (_text: string, _duration?: number, _onClose?: () => void) => void;
  fail: (_text: string, _duration?: number, _onClose?: () => void) => void;
  info: (_text: string, _duration?: number, _onClose?: () => void) => void;
  loading: (_text?: string, _duration?: number, _onClose?: () => void) => void;
  clear: () => void;
} = ({ currentKey, icon, text, duration = 2000, onClose }) => {
  const currentVisualScheme = useVisualScheme(state => state.currentStyle);
  const themeName = useVisualScheme(state => state.themeName);
  const deleteChildren = usePortalStore(state => state.deleteChildren);
  const isClosedRef = useRef(false);

  const timeoutMs = normalizeDuration(duration);

  useEffect(() => {
    if (timeoutMs <= 0) return;

    const timer = setTimeout(() => {
      isClosedRef.current = true;
      if (onClose) onClose();
      if (currentKey !== undefined) {
        deleteChildren(currentKey);
      }
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [currentKey, timeoutMs, deleteChildren, onClose]);

  // 组件意外或被外部提前清除时触发 onClose
  useEffect(() => {
    return () => {
      if (!isClosedRef.current && onClose) {
        onClose();
      }
    };
  }, [onClose]);

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return <View style={styles.iconContainer}>{icon}</View>;
    }

    if (icon === 'success') {
      return (
        <View style={styles.iconContainer}>
          <Image
            source={SuccessIcon as ImageSourcePropType}
            style={styles.imageIcon}
            resizeMode="contain"
          />
        </View>
      );
    }
    if (icon === 'fail') {
      return (
        <View style={styles.iconContainer}>
          <AntDesign name="close-circle" size={44} color="#FF4D4F" />
        </View>
      );
    }
    if (icon === 'info') {
      return (
        <View style={styles.iconContainer}>
          <Ionicons
            name="information-circle-outline"
            size={46}
            color={commonColors.purple}
          />
        </View>
      );
    }
    if (icon === 'loading') {
      return (
        <View style={styles.iconContainer}>
          <ActivityIndicator size="large" color={commonColors.purple} />
        </View>
      );
    }
    return null;
  };

  return (
    <Overlay
      isVisible={true}
      backdropStyle={styles.backdrop}
      overlayStyle={[
        styles.overlayContainer,
        currentVisualScheme?.modal_background_style ?? {
          backgroundColor: themeName === 'dark' ? '#2A2A2E' : '#FFFFFF',
        },
      ]}
    >
      <View style={styles.contentWrapper}>
        {renderIcon()}
        {Boolean(text) && (
          <Text
            style={[
              styles.messageText,
              currentVisualScheme?.text_style,
              themeName === 'dark'
                ? { color: '#E5E5E5' }
                : { color: commonColors.darkGray },
            ]}
          >
            {text}
          </Text>
        )}
      </View>
    </Overlay>
  );
};

Toast.show = (props: ToastProps | string, duration?: number) => {
  const finalProps: ToastProps =
    typeof props === 'string'
      ? { text: props, duration }
      : { ...props, duration: duration ?? props.duration };

  usePortalStore.getState().appendChildren(<Toast {...finalProps} />, 'toast');
};

Toast.success = (text: string, duration?: number, onClose?: () => void) => {
  Toast.show({
    icon: 'success',
    text,
    duration,
    onClose,
  });
};

Toast.fail = (text: string, duration?: number, onClose?: () => void) => {
  Toast.show({
    icon: 'fail',
    text,
    duration,
    onClose,
  });
};

Toast.info = (text: string, duration?: number, onClose?: () => void) => {
  Toast.show({
    icon: 'info',
    text,
    duration,
    onClose,
  });
};

Toast.loading = (text?: string, duration = 0, onClose?: () => void) => {
  Toast.show({
    icon: 'loading',
    text,
    duration,
    onClose,
  });
};

Toast.clear = () => {
  const { elements, deleteBatchChildren } = usePortalStore.getState();
  const keysToClear = Object.entries(elements)
    .filter(
      ([_, element]) =>
        element && (element.props as any)?.portalType === 'toast'
    )
    .map(([key]) => Number(key));

  if (keysToClear.length > 0) {
    deleteBatchChildren(keysToClear);
  }
};

export default Toast;

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'transparent',
  },
  overlayContainer: {
    minWidth: 160,
    maxWidth: 280,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 0,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  iconContainer: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  imageIcon: {
    width: 48,
    height: 48,
  },
  messageText: {
    ...commonStyles.fontMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
});
