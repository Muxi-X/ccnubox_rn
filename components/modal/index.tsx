import { LinearGradient } from 'expo-linear-gradient';
import React, { FC, ReactElement, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
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

//eslint-disable-next-line no-unused-vars
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
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const { deleteChildren } = usePortalStore(({ deleteChildren }) => ({
    deleteChildren,
  }));
  useEffect(() => {
    setVisible(initVisible);
  }, [initVisible]);
  const handleClose = () => {
    setVisible(false);
    onClose && onClose();
    // FIX_ME： 由于rn自带modal不支持获取动画结束时间
    // 因此这里采取定时器的方案
    // 过一秒后清除动画
    setTimeout(() => {
      currentKey && deleteChildren(currentKey);
    }, 1000);
  };
  const modalContent = useMemo(() => {
    return (
      <>
        {/* 只有底部弹窗才有渐变 */}
        {isBottomMode && (
          <LinearGradient
            colors={['#C5B8F8BB', '#E6E1F900']}
            style={styles.linearGradient}
          ></LinearGradient>
        )}
        {title && (
          <View style={[styles.title]}>
            {typeof title === 'string' ? (
              <Text
                style={[commonStyles.fontExtraLarge, currentStyle?.text_style]}
              >
                {title}
              </Text>
            ) : (
              title
            )}
          </View>
        )}
        <View style={styles.modalChildren}>
          {typeof children === 'string' ? (
            <Text style={[currentStyle?.text_style, commonStyles.fontLarge]}>
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
        <View style={styles.bottomChoice}>
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
                  !isBottomMode && currentStyle?.text_style,
                  isBottomMode
                    ? commonStyles.fontLarge
                    : commonStyles.fontMedium,
                ]}
              >
                {confirmText ?? '确认'}
              </Text>
            </View>
          </TouchableOpacity>
          {/* showCancel 决定是否显示取消按钮 */}
          {showCancel && (
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
                    !isBottomMode && currentStyle?.text_style,
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
        </View>
      </>
    );
  }, [children, mode]);
  return (
    <ModalBack visible={visible} style={{ zIndex: currentKey }}>
      <View
        style={[
          styles.modalOverlay,
          {
            justifyContent: isBottomMode ? 'flex-end' : 'center',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackground}
          onPress={handleClose}
        ></TouchableOpacity>
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
  { children?: ReactElement; visible: boolean } & ViewProps
> = ({ children, style, visible }) => {
  return (
    <>
      <AnimatedOpacity
        duration={500}
        toVisible={visible}
        style={[
          {
            flex: 1,
            width: percent2px(100),
            height: percent2px(100, 'height'),
            position: 'absolute',
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
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
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
    width: '94%',
    borderRadius: 20,
    margin: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
