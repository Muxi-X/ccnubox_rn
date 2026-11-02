import { Dialog as RNEUIDialog } from '@rneui/themed';
import React, { FC } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import Button from '@/components/button';
import {
  DialogAlertOptions,
  DialogConfirmOptions,
  DialogProps,
} from '@/components/dialog/type';
import { usePortalStore } from '@/store/portal';
import {
  getDialogHeight,
  popupTokens,
  usePopupColors,
} from '@/styles/popupTokens';

const Dialog: FC<DialogProps> & {
  alert: (_options: DialogAlertOptions | string) => () => void;
  confirm: (_options: DialogConfirmOptions) => () => void;
  show: (_props: DialogProps) => () => void;
  clear: () => void;
  Row: FC<{
    label: string;
    value: string | number;
    valueColor?: string;
    fontSize?: number;
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    valueStyle?: StyleProp<TextStyle>;
    align?: 'left' | 'space-between';
  }>;
  ScoreDisplay: FC<{
    value: string | number;
    label?: string;
  }>;
} = ({
  isVisible = true,
  currentKey,
  size = 'feedback',
  title,
  message,
  children,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  onBackdropPress,
  containerStyle,
  titleWrapperStyle,
  titleStyle,
  messageStyle,
  isLoading = false,
  confirmButtonColor,
}) => {
  const popupColors = usePopupColors();
  const deleteChildren = usePortalStore(state => state.deleteChildren);
  const targetHeight = getDialogHeight(size);

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
        {
          backgroundColor: popupColors.surface,
          minHeight: targetHeight,
        },
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.contentWrapper,
          !title && !message && { justifyContent: 'center' },
        ]}
      >
        {Boolean(title) && (
          <View style={[styles.titleWrapper, titleWrapperStyle]}>
            {typeof title === 'string' ? (
              <Text
                style={[
                  styles.titleText,
                  { color: popupColors.primaryText },
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
                  { color: popupColors.primaryText },
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
      </View>

      {(showCancel || showConfirm) && (
        <View style={styles.actionsWrapper}>
          {showCancel && (
            <Button
              type="Round"
              letterSpacing="5%"
              containerStyle={styles.buttonContainer}
              buttonStyle={[
                styles.cancelButtonStyle,
                {
                  backgroundColor: popupColors.cancelButtonBg,
                  borderColor: popupColors.cancelButtonText,
                },
              ]}
              textStyle={[
                styles.buttonText,
                { color: popupColors.cancelButtonText },
              ]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}
          {showConfirm && (
            <Button
              type="Round"
              letterSpacing="5%"
              containerStyle={styles.buttonContainer}
              buttonStyle={[
                styles.confirmButtonStyle,
                {
                  backgroundColor: confirmButtonColor || popupColors.accent,
                },
              ]}
              textStyle={[styles.buttonText, { color: '#FFFFFF' }]}
              onPress={handleConfirm}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          )}
        </View>
      )}
    </RNEUIDialog>
  );
};

/**
 * 辅助排版组件：数据键值对展示项（如平时成绩列表、地点/时间列表）
 * 左侧标签默认次级灰色 8F8F8F (字号15)，右侧默认高亮强调色 867DF1 (字号15)
 * 默认靠左紧挨排布，支持自定义 fontSize 与对齐方式
 */
Dialog.Row = ({
  label,
  value,
  valueColor,
  fontSize,
  style,
  labelStyle,
  valueStyle,
  align = 'left',
}) => {
  const popupColors = usePopupColors();
  return (
    <View
      style={[
        styles.rowContainer,
        align === 'space-between'
          ? { justifyContent: 'space-between' }
          : { justifyContent: 'flex-start' },
        style,
      ]}
    >
      <Text
        style={[
          styles.rowLabel,
          { color: popupColors.secondaryText },
          fontSize ? { fontSize } : null,
          labelStyle,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.rowValue,
          { color: valueColor || popupColors.accent },
          fontSize ? { fontSize } : null,
          valueStyle,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

/**
 * 辅助排版组件：成绩计算结果数值大字展示
 * 数值字号 64，标签字号 15
 */
Dialog.ScoreDisplay = ({ value, label = '平均学分绩' }) => {
  const popupColors = usePopupColors();
  return (
    <View style={styles.scoreContainer}>
      <Text style={[styles.scoreValue, { color: popupColors.primaryText }]}>
        {value}
      </Text>
      {Boolean(label) && (
        <Text style={[styles.scoreLabel, { color: popupColors.primaryText }]}>
          {label}
        </Text>
      )}
    </View>
  );
};

// 返回可直接销毁该弹窗的 close 函数
Dialog.show = (props: DialogProps) => {
  const key = usePortalStore
    .getState()
    .appendChildren(<Dialog {...props} />, 'dialog');
  return () => {
    if (key >= 0) {
      usePortalStore.getState().deleteChildren(key);
    }
  };
};

Dialog.alert = (options: DialogAlertOptions | string) => {
  const finalOptions: DialogAlertOptions =
    typeof options === 'string'
      ? { title: '提示', message: options }
      : {
          title: options.title === undefined ? '提示' : options.title,
          ...options,
        };

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
    width: popupTokens.dimensions.dialog.defaultWidth, // 343
    maxWidth: '90%',
    borderRadius: popupTokens.radius.dialog, // 25
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 'auto',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0,
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexGrow: 1,
    flexShrink: 0,
  },
  titleWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 38,
    flexShrink: 0,
  },
  titleText: {
    fontSize: popupTokens.fontSize.dialogTitle, // 22
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  messageWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 58,
    flexShrink: 0,
  },
  messageText: {
    fontSize: popupTokens.fontSize.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionsWrapper: {
    marginTop: 'auto',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: 16,
    marginBottom: 8,
    flexShrink: 0,
  },
  buttonContainer: {
    width: 120,
  },
  buttonText: {
    fontSize: popupTokens.fontSize.body, // 15
    fontWeight: '600',
  },
  confirmButtonStyle: {
    paddingVertical: 7,
    paddingHorizontal: 15,
  },
  cancelButtonStyle: {
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 15,
  },
  // 辅助排版样式
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  rowLabel: {
    fontSize: popupTokens.fontSize.body, // 15
    marginRight: 6,
  },
  rowValue: {
    fontSize: popupTokens.fontSize.body, // 15
    fontWeight: '400',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  scoreValue: {
    fontSize: popupTokens.fontSize.display, // 64
    fontWeight: '400',
    textAlign: 'center',
  },
  scoreLabel: {
    fontSize: popupTokens.fontSize.body, // 15
    marginTop: 8,
    textAlign: 'center',
  },
});
