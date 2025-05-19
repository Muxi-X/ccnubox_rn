import { LinearGradient } from 'expo-linear-gradient';
import React, { FC, ReactElement, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';

import AnimatedOpacity from '@/components/animatedView/AnimatedOpacity';
import AnimatedScale from '@/components/animatedView/AnimatedScale';
import AnimatedSlide from '@/components/animatedView/AnimatedSlide';
import { ModalProps, ModalTriggerProps } from '@/components/modal/types';

import { usePortalStore } from '@/store/portal';
import useVisualScheme from '@/store/visualScheme';

import { commonColors, commonStyles } from '@/styles/common';
import { percent2px } from '@/utils';

 
const Modal: React.FC<ModalProps> & { show: (props: ModalProps) => number } = ({
  visible: initVisible = true,
  currentKey,
  onClose,
  children,
  title,
  onCancel,
  onConfirm,
  showCancel = true,
  mode = 'bottom',
  confirmText,
  cancelText,
}) => {
  const handleConfirm = () => {
    onConfirm && onConfirm();
    handleClose();
  };
  const handleCancel = () => {
    onCancel && onCancel();
    handleClose();
  };
  const isBottomMode = useMemo(() => {
    return mode !== 'middle';
  }, [mode]);
  const [visible, setVisible] = useState<boolean>(initVisible);
  const { currentStyle, themeName } = useVisualScheme(
    ({ currentStyle, themeName }) => ({ currentStyle, themeName })
  );
  const { deleteChildren } = usePortalStore(({ deleteChildren }) => ({
    deleteChildren,
  }));
  useEffect(() => {
    setVisible(initVisible);
    const backAction = () => {
      setVisible(false);
      return true; // 阻止默认返回行为
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [initVisible]);
  const handleClose = () => {
    setVisible(false);
    onClose && onClose();
  };
  const showButtons = useMemo(() => {
    return confirmText || onConfirm || (showCancel && (cancelText || onCancel));
  }, [confirmText, onConfirm, showCancel, cancelText, onCancel]);

  const modalContent = useMemo(() => {
    return (
      <>
        {/* 只有浅色模式底部弹窗才有渐变 */}
        {isBottomMode && themeName === 'light' && (
          <LinearGradient
            colors={['#C5B8F8BB', '#E6E1F900']}
            style={styles.linearGradient}
          ></LinearGradient>
        )}
        {title && (
          <View style={[styles.title]}>
            {typeof title === 'string' ? (
              <Text style={[commonStyles.fontLarge, currentStyle?.text_style as TextStyle]}>
                {title}
              </Text>
            ) : (
              title
            )}
          </View>
        )}
        <View style={styles.modalChildren}>
          {typeof children === 'string' ? (
            <Text
              style={[
                currentStyle?.text_style as TextStyle,
                commonStyles.fontMedium,
                {
                  paddingVertical: 15,
                },
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
        {showButtons && (
          <View style={styles.bottomChoice}>
            {/* showCancel 决定是否显示取消按钮 */}
            {showCancel && (cancelText || onCancel) && (
              <TouchableOpacity onPress={handleCancel}>
                <View
                  style={
                    !isBottomMode && {
                      ...styles.cancelViewStyle,
                      ...styles.buttonStyle,
                    }
                  }
                >
                  <Text
                    style={[
                      styles.bottomChoiceText,
                      !isBottomMode && currentStyle?.text_style as TextStyle,
                      isBottomMode
                        ? commonStyles.fontLarge
                        : commonStyles.fontMedium,
                    ]}
                  >
                    {cancelText ?? '取消'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {(confirmText || onConfirm) && (
              <TouchableOpacity onPress={handleConfirm}>
                <View
                  style={
                    !isBottomMode && {
                      ...styles.confirmViewStyle,
                      ...styles.buttonStyle,
                    }
                  }
                >
                  <Text
                    style={[
                      styles.bottomChoiceText,
                      !isBottomMode && currentStyle?.text_style as TextStyle,
                      isBottomMode
                        ? commonStyles.fontLarge
                        : commonStyles.fontMedium,
                    ]}
                  >
                    {confirmText ?? '确认'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </>
    );
  }, [
    children,
    mode,
    showButtons,
    showCancel,
    cancelText,
    onCancel,
    confirmText,
    onConfirm,
  ]);
  useEffect(() => {
    if (!visible) {
      let timer = setTimeout(() => {
        currentKey !== undefined && deleteChildren(currentKey);
        clearTimeout(timer);
      }, 200);
    }
  }, [visible, currentKey]);
  return (
    <ModalBack visible={visible} style={{ zIndex: currentKey }}>
      <View
        style={[
          styles.modalOverlay,
          {
            justifyContent: isBottomMode ? 'flex-end' : 'center',
            paddingBottom: isBottomMode ? percent2px(20) : 0,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.modalBackground,
            {
              height: '100%',
              zIndex: 0,
            },
          ]}
          onPress={handleClose}
        />
        {/* 底部 modal 与中部动画不一致 */}
        {isBottomMode ? (
          <AnimatedSlide
            distance={100}
            direction="vertical"
            duration={200}
            trigger={visible}
            style={[styles.modalContent, currentStyle?.modal_background_style]}
          >
            {modalContent}
          </AnimatedSlide>
        ) : (
          <AnimatedScale
            duration={400}
            outputRange={[0.6, 1]}
            trigger={visible}
            style={[styles.modalContent, currentStyle?.modal_background_style]}
          >
            {modalContent}
          </AnimatedScale>
        )}
      </View>
    </ModalBack>
  );
};
/**
 * 函数式方法
 * @param props modal 参数
 * @example 示例
 * Modal.show({title: '123'})
 */
Modal.show = props => {
  const { appendChildren } = usePortalStore.getState();
  return appendChildren(<Modal {...props}></Modal>, 'modal');
};
/**
 * 带有触发按钮的 trigger
 * @param props
 * @constructor
 * @example 示例
 * <ModalTrigger triggerComponent={<Text>点我</Text>}>
 *    <View>
 *      <Text>弹窗内容</Text>
 *    </View>
 *  </ModalTrigger>
 */
export const ModalTrigger: React.FC<ModalTriggerProps> = props => {
  const { triggerComponent, ...restProps } = props;
  const [key, setKey] = useState<number>(-1);
  const handlePress = () => {
    setKey(Modal.show(restProps));
  };
  useEffect(() => {
    key !== -1 && usePortalStore.getState().updateChildren(key, restProps);
  }, [props, key]);
  return (
    <>
      <TouchableOpacity onPress={handlePress}>
        {triggerComponent ?? <Text>触发弹窗</Text>}
      </TouchableOpacity>
      {/*<Modal {...restProps} visible={true}></Modal>*/}
    </>
  );
};

export const ModalBack: FC<
  {
    children?: ReactElement;
    visible: boolean;
    onAnimationEnd?: (visible: boolean) => void;
  } & ViewProps
> = ({ children, style, visible, onAnimationEnd }) => {
  const [displayMode, setDisplayMode] = useState<'flex' | 'none'>(
    visible ? 'flex' : 'none'
  );
  if (displayMode === 'none') return <></>;
  return (
    <>
      <AnimatedOpacity
        duration={500}
        toVisible={visible}
        onAnimationEnd={() => {
          setDisplayMode(visible ? 'flex' : 'none');
          onAnimationEnd && onAnimationEnd(visible);
        }}
        style={[
          {
            flex: 1,
            width: percent2px(100),
            // 这里 dimension 获取到的屏幕高度不带全面屏底部的手势条高度，只能 110% 了
            height: percent2px(110, 'height'),
            // height: '100%',
            position: 'absolute',
            display: displayMode,
            top: 0,
          },
          style,
        ]}
      >
        {children}
      </AnimatedOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  bottomChoice: {
    marginTop: 20,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 30,
  },
  bottomChoiceText: {
    color: commonColors.purple,
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    margin: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    display: 'flex',
    overflow: 'hidden',
  },
  modalChildren: {
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmViewStyle: {
    backgroundColor: commonColors.purple,
  },
  cancelViewStyle: {
    backgroundColor: commonColors.gray,
  },
  buttonStyle: {
    width: 120,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginHorizontal: 20,
  },
  closeButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  linearGradient: {
    width: '100%',
    height: '40%',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  title: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  closeText: {
    color: commonColors.lightGray,
    fontWeight: 'bold',
  },
});

export default Modal;
