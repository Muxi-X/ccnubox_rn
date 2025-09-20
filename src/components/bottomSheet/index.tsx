import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { CustomBottomSheetProps, CustomBottomSheetRef } from './type';

export const CustomBottomSheet = forwardRef<
  CustomBottomSheetRef,
  CustomBottomSheetProps
>(
  (
    {
      children,
      snapPoints = ['50%', '90%'],
      enablePanDownToClose = true,
      showBackdrop = true,
      enableScrollView = true,
      scrollViewProps,
      onOpen,
      onClose,
      onChange,
    },
    ref
  ) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      open: () => {
        bottomSheetRef.current?.snapToIndex(0);
        onOpen?.();
      },
      close: () => {
        bottomSheetRef.current?.close();
        onClose?.();
      },
      snapToIndex: (index: number) => {
        bottomSheetRef.current?.snapToIndex(index);
      },
    }));

    // BottomSheet 状态变化处理
    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) {
          onClose?.();
        }
        onChange?.(index);
      },
      [onChange, onClose]
    );

    // 渲染背景遮罩
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          {...props}
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // 初始关闭状态
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={showBackdrop ? renderBackdrop : undefined}
        enablePanDownToClose={enablePanDownToClose}
      >
        <BottomSheetView style={{ flex: 1, backgroundColor: '#fff' }}>
          {enableScrollView ? (
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'space-evenly',
              }}
              showsVerticalScrollIndicator={false}
              {...scrollViewProps}
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);
