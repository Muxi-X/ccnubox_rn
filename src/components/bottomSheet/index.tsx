import { BottomSheet as RNEUIBottomSheet } from '@rneui/themed';
import React, { FC, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  BottomSheetProps,
  BottomSheetTriggerProps,
} from '@/components/bottomSheet/type';
import Button from '@/components/button';
import { usePortalStore } from '@/store/portal';
import useVisualScheme from '@/store/visualScheme';
import { commonStyles } from '@/styles/common';

const BottomSheet: FC<BottomSheetProps> & {
  show: (_props: BottomSheetProps) => () => void;
  clear: () => void;
} = ({
  isVisible = true,
  currentKey,
  title,
  children,
  onBackdropPress,
  onCancel,
  onConfirm,
  onClose,
  confirmText = '确定',
  cancelText = '取消',
  showButtons = false,
  buttonType = 'Round',
  containerStyle,
  backdropStyle,
  contentStyle,
  titleStyle,
  showHandle = true,
  scrollViewProps,
}) => {
  const currentVisualScheme = useVisualScheme(state => state.currentStyle);
  const themeName = useVisualScheme(state => state.themeName);
  const deleteChildren = usePortalStore(state => state.deleteChildren);

  const closeBottomSheet = () => {
    if (onClose) onClose();
    if (currentKey !== undefined) {
      deleteChildren(currentKey);
    }
  };

  const handleBackdrop = () => {
    if (onBackdropPress) {
      onBackdropPress();
    } else {
      closeBottomSheet();
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeBottomSheet();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeBottomSheet();
  };

  const shouldRenderButtons =
    showButtons || Boolean(onConfirm) || Boolean(confirmText && cancelText);

  return (
    <RNEUIBottomSheet
      isVisible={isVisible}
      onBackdropPress={handleBackdrop}
      containerStyle={containerStyle}
      backdropStyle={[styles.backdrop, backdropStyle]}
      scrollViewProps={{
        bounces: false,
        ...scrollViewProps,
      }}
    >
      <View
        style={[
          styles.contentCard,
          currentVisualScheme?.modal_background_style ?? {
            backgroundColor: themeName === 'dark' ? '#2A2A2E' : '#FFFFFF',
          },
          contentStyle,
        ]}
      >
        {showHandle && (
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handleBar,
                {
                  backgroundColor: themeName === 'dark' ? '#555555' : '#D1D5DB',
                },
              ]}
            />
          </View>
        )}

        {Boolean(title) && (
          <View style={styles.titleContainer}>
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

        <View style={styles.body}>{children}</View>

        {shouldRenderButtons && (
          <View style={styles.actionsContainer}>
            {cancelText !== false && (
              <Button
                type={buttonType}
                letterSpacing="5%"
                containerStyle={styles.buttonContainer}
                buttonStyle={[
                  styles.cancelButtonStyle,
                  themeName === 'dark' && { backgroundColor: '#2A2A2E' },
                ]}
                textStyle={{ color: '#6A69E6' }}
                onPress={handleCancel}
              >
                {cancelText}
              </Button>
            )}
            {confirmText !== false && (
              <Button
                type={buttonType}
                letterSpacing="5%"
                containerStyle={styles.buttonContainer}
                onPress={handleConfirm}
              >
                {confirmText}
              </Button>
            )}
          </View>
        )}
      </View>
    </RNEUIBottomSheet>
  );
};

BottomSheet.show = (props: BottomSheetProps) => {
  const key = usePortalStore
    .getState()
    .appendChildren(<BottomSheet {...props} />, 'bottomSheet');
  return () => {
    if (key >= 0) {
      usePortalStore.getState().deleteChildren(key);
    }
  };
};

BottomSheet.clear = () => {
  const { elements, deleteBatchChildren } = usePortalStore.getState();
  const keysToClear = Object.entries(elements)
    .filter(
      ([_, element]) =>
        element && (element.props as any)?.portalType === 'bottomSheet'
    )
    .map(([key]) => Number(key));

  if (keysToClear.length > 0) {
    deleteBatchChildren(keysToClear);
  }
};

export const BottomSheetTrigger: FC<BottomSheetTriggerProps> = props => {
  const { triggerComponent, style, ...restProps } = props;
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} style={style}>
        {triggerComponent ?? <Text>触发弹窗</Text>}
      </TouchableOpacity>
      <BottomSheet
        {...restProps}
        isVisible={visible}
        onClose={() => setVisible(false)}
        onBackdropPress={() => setVisible(false)}
        onConfirm={() => {
          if (restProps.onConfirm) restProps.onConfirm();
          setVisible(false);
        }}
        onCancel={() => {
          if (restProps.onCancel) restProps.onCancel();
          setVisible(false);
        }}
      />
    </>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  contentCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingBottom: 24,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  titleText: {
    ...commonStyles.fontLarge,
    fontWeight: '600',
    textAlign: 'center',
  },
  body: {
    width: '100%',
  },
  actionsContainer: {
    marginTop: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
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
