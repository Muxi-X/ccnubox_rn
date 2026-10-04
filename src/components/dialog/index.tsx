import { Dialog as RNEUIDialog } from '@rneui/themed';
import React, { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/button';
import {
  DialogAlertOptions,
  DialogConfirmOptions,
  DialogProps,
} from '@/components/dialog/type';
import { usePortalStore } from '@/store/portal';
import useVisualScheme from '@/store/visualScheme';
import { commonColors, commonStyles } from '@/styles/common';

const Dialog: FC<DialogProps> & {
  alert: (_options: DialogAlertOptions | string) => () => void;
  confirm: (_options: DialogConfirmOptions) => () => void;
  show: (_props: DialogProps) => () => void;
  clear: () => void;
} = ({
  isVisible = true,
  currentKey,
  title,
  message,
  children,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  onBackdropPress,
  containerStyle,
  titleStyle,
  messageStyle,
  isLoading = false,
}) => {
  const currentVisualScheme = useVisualScheme(state => state.currentStyle);
  const themeName = useVisualScheme(state => state.themeName);
  const deleteChildren = usePortalStore(state => state.deleteChildren);

  const closeDialog = () => {
    if (currentKey !== undefined) {
      deleteChildren(currentKey);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeDialog();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeDialog();
  };

  const handleBackdrop = () => {
    if (onBackdropPress) {
      onBackdropPress();
    } else if (currentKey !== undefined) {
      // 命令式默认点击遮罩关闭
      closeDialog();
    }
  };

  const showConfirm = Boolean(confirmText);
  const showCancel = Boolean(cancelText);

  return (
    <RNEUIDialog
      isVisible={isVisible}
      onBackdropPress={handleBackdrop}
      overlayStyle={[
        styles.dialogContainer,
        currentVisualScheme?.modal_background_style,
        containerStyle,
      ]}
    >
      {Boolean(title) && (
        <View style={styles.titleWrapper}>
          {typeof title === 'string' ? (
            <Text
              style={[
                styles.titleText,
                currentVisualScheme?.text_style,
                titleStyle,
              ]}
            >
              {title}
            </Text>
          ) : (
            title
          )}
        </View>
      )}

      {Boolean(message) && (
        <View style={styles.messageWrapper}>
          {typeof message === 'string' ? (
            <Text
              style={[
                styles.messageText,
                currentVisualScheme?.text_style,
                themeName === 'dark'
                  ? { color: '#B0B0B0' }
                  : { color: commonColors.darkGray },
                messageStyle,
              ]}
            >
              {message}
            </Text>
          ) : (
            message
          )}
        </View>
      )}

      {children}

      {(showCancel || showConfirm) && (
        <View style={styles.actionsWrapper}>
          {showCancel && (
            <Button
              type="Round"
              letterSpacing="5%"
              containerStyle={styles.buttonContainer}
              buttonStyle={[
                styles.cancelButtonStyle,
                themeName === 'dark' && { backgroundColor: '#2A2A2E' },
              ]}
              textStyle={{ color: '#6A69E6' }}
              onPress={handleCancel}
              disabled={isLoading}
            >
              {cancelText as string}
            </Button>
          )}
          {showConfirm && (
            <Button
              type="Round"
              letterSpacing="5%"
              containerStyle={styles.buttonContainer}
              onPress={handleConfirm}
              isLoading={isLoading}
            >
              {confirmText as string}
            </Button>
          )}
        </View>
      )}
    </RNEUIDialog>
  );
};

// 返回可直接销毁该弹窗的 close 函数
Dialog.show = (props: DialogProps) => {
  const key = usePortalStore
    .getState()
    .appendChildren(<Dialog {...props} />, 'dialog');
  return () => {
    if (key !== undefined && key >= 0) {
      usePortalStore.getState().deleteChildren(key);
    }
  };
};

Dialog.alert = (options: DialogAlertOptions | string) => {
  const finalOptions: DialogAlertOptions =
    typeof options === 'string' ? { message: options } : options;

  return Dialog.show({
    ...finalOptions,
    cancelText: false,
  });
};

Dialog.confirm = (options: DialogConfirmOptions) => {
  return Dialog.show(options);
};

Dialog.clear = () => {
  const { elements, deleteBatchChildren } = usePortalStore.getState();
  const keysToClear = Object.entries(elements)
    .filter(
      ([_, element]) =>
        element && (element.props as any)?.portalType === 'dialog'
    )
    .map(([key]) => Number(key));

  if (keysToClear.length > 0) {
    deleteBatchChildren(keysToClear);
  }
};

export default Dialog;

const styles = StyleSheet.create({
  dialogContainer: {
    width: '80%',
    maxWidth: 340,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0,
  },
  titleWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    ...commonStyles.fontLarge,
    fontWeight: '600',
    textAlign: 'center',
  },
  messageWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  messageText: {
    ...commonStyles.fontMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionsWrapper: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  buttonContainer: {
    width: 120,
  },
  cancelButtonStyle: {
    borderWidth: 1,
    borderColor: '#6A69E6',
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 15,
  },
});
