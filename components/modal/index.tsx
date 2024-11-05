import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal as NativeModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import AnimatedScale from '@/components/animatedView/AnimatedScale';
import AnimatedSlide from '@/components/animatedView/AnimatedSlide';
import { ModalProps, ModalTriggerProps } from '@/components/modal/types';
import { usePortalStore } from '@/store/portal';
import { commonColors, commonStyles } from '@/styles/common';

const Modal: React.FC<ModalProps> & { show: (props: ModalProps) => void } = ({
  visible: initVisible = true,
  onClose,
  children,
  title = '123123',
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
  const { deleteChildren, elementTypeMap } = usePortalStore(
    ({ deleteChildren, elementTypeMap }) => ({ deleteChildren, elementTypeMap })
  );
  useEffect(() => {
    setVisible(initVisible);
  }, [initVisible]);
  const handleClose = () => {
    setVisible(false);
    onClose && onClose();
    setTimeout(() => {
      console.log(
        'inner',
        elementTypeMap['modal'],
        (elementTypeMap['modal'] ?? [1]).at(-1)
      );
      deleteChildren(
        (elementTypeMap['modal'] ?? [1]).at(-1) as number,
        'modal'
      );
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
            <Text style={commonStyles.fontExtraLarge}>{title}</Text>
          </View>
        )}
        <View style={styles.modalChildren}>{children}</View>
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
                  !isBottomMode && {
                    color: commonColors.white,
                  },
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
                    !isBottomMode && {
                      color: commonColors.white,
                    },
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
    <NativeModal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalOverlay,
          {
            justifyContent: isBottomMode ? 'flex-end' : 'center',
            alignItems: 'center',
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
            style={styles.modalContent}
          >
            {modalContent}
          </AnimatedSlide>
        ) : (
          <AnimatedScale
            duration={400}
            outputRange={[0.6, 1]}
            trigger={visible}
            style={[styles.modalContent]}
          >
            {modalContent}
          </AnimatedScale>
        )}
      </View>
    </NativeModal>
  );
};
/**
 * 函数式方法
 * @param props modal 参数
 * @example 示例
 * Modal.show({title: '123'})
 */
Modal.show = props => {
  const { updateChildren } = usePortalStore.getState();
  updateChildren(<Modal {...props}></Modal>, 'modal');
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
  const [modalShow, setModalShow] = useState<boolean>(false);
  const { onPress, children, triggerComponent, onClose, ...restProps } = props;
  const handlePress = () => {
    setModalShow(true);
    onPress && onPress();
  };
  const handleClose = () => {
    setModalShow(false);
    onClose && onClose();
  };
  return (
    <>
      <TouchableOpacity onPress={handlePress}>
        {triggerComponent ?? <Text>触发弹窗</Text>}
      </TouchableOpacity>
      <Modal {...restProps} onClose={handleClose} visible={modalShow}>
        {children}
      </Modal>
    </>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    backgroundColor: 'white',
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
    color: '#333',
    fontWeight: 'bold',
  },
});

export default Modal;
