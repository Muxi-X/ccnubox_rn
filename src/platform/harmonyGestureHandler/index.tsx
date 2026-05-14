import React from 'react';
import {
  FlatList as RNFlatList,
  type FlatListProps,
  ScrollView as RNScrollView,
  type ScrollViewProps,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
  type ViewProps,
} from 'react-native';

type GestureHandlerRootViewProps = ViewProps;
type GestureDetectorProps = {
  children?: React.ReactNode;
  gesture?: unknown;
};
type SwipeableProps = ViewProps & {
  children?: React.ReactNode;
  renderLeftActions?: (...args: any[]) => React.ReactNode;
  renderRightActions?: (...args: any[]) => React.ReactNode;
};

const createGestureBuilder = () => {
  const builder: Record<string | symbol, unknown> = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === Symbol.toStringTag) {
          return 'HarmonyGestureBuilder';
        }

        if (prop === 'toGestureArray') {
          return () => [builder];
        }

        return () => builder;
      },
    }
  );

  return builder;
};

export const Gesture = {
  Pan: createGestureBuilder,
  Tap: createGestureBuilder,
  LongPress: createGestureBuilder,
  Pinch: createGestureBuilder,
  Rotation: createGestureBuilder,
  Fling: createGestureBuilder,
  Native: createGestureBuilder,
  Manual: createGestureBuilder,
  Simultaneous: () => createGestureBuilder(),
  Exclusive: () => createGestureBuilder(),
  Race: () => createGestureBuilder(),
};

export const GestureHandlerRootView = React.forwardRef<
  View,
  GestureHandlerRootViewProps
>(({ children, ...props }, ref) => (
  <View ref={ref} {...props}>
    {children}
  </View>
));

GestureHandlerRootView.displayName = 'HarmonyGestureHandlerRootView';

export const GestureDetector = ({ children }: GestureDetectorProps) => (
  <>{children}</>
);

export const Swipeable = React.forwardRef<unknown, SwipeableProps>(
  (
    {
      children,
      style,
      renderLeftActions: _renderLeftActions,
      renderRightActions: _renderRightActions,
      ..._props
    },
    ref
  ) => {
    const innerRef = React.useRef<View | null>(null);

    React.useImperativeHandle(ref, () => ({
      close() {},
      openLeft() {},
      openRight() {},
      reset() {},
    }));

    return (
      <View ref={innerRef} style={style}>
        {children}
      </View>
    );
  }
);

Swipeable.displayName = 'HarmonySwipeable';

export const ScrollView = React.forwardRef<RNScrollView, ScrollViewProps>(
  ({ children, ...props }, ref) => (
    <RNScrollView ref={ref} {...props}>
      {children}
    </RNScrollView>
  )
);

ScrollView.displayName = 'HarmonyGestureScrollView';

export const FlatList = React.forwardRef<
  RNFlatList<unknown>,
  FlatListProps<unknown>
>((props, ref) => <RNFlatList ref={ref} {...props} />);

FlatList.displayName = 'HarmonyGestureFlatList';

export const RectButton = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  TouchableOpacityProps & { rippleColor?: string }
>(
  (
    {
      accessibilityLabel,
      accessibilityRole,
      accessible,
      activeOpacity,
      children,
      disabled,
      onLongPress,
      onPress,
      onPressIn,
      onPressOut,
      rippleColor: _rippleColor,
      style,
      testID,
    },
    ref
  ) => (
    <TouchableOpacity
      ref={ref}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessible={accessible}
      activeOpacity={activeOpacity}
      disabled={disabled}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={style}
      testID={testID}
    >
      {children}
    </TouchableOpacity>
  )
);

RectButton.displayName = 'HarmonyRectButton';

export const BorderlessButton = RectButton;
export const BaseButton = RectButton;

export const PanGestureHandler = GestureHandlerRootView;
export const TapGestureHandler = GestureHandlerRootView;
export const NativeViewGestureHandler = GestureHandlerRootView;
export const FlingGestureHandler = GestureHandlerRootView;
export const RotationGestureHandler = GestureHandlerRootView;
export const PinchGestureHandler = GestureHandlerRootView;
export const ForceTouchGestureHandler = GestureHandlerRootView;
export const LongPressGestureHandler = GestureHandlerRootView;

export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

export const Directions = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
};

export const gestureHandlerRootHOC = <TProps,>(
  Component: React.ComponentType<TProps>
) => Component;
export const createNativeWrapper = <TProps,>(
  Component: React.ComponentType<TProps>
) => Component;

export const DrawerLayout = React.forwardRef<
  unknown,
  ViewProps & {
    children?: React.ReactNode;
    renderNavigationView?: () => React.ReactNode;
  }
>(({ children, style }, ref) => {
  const innerRef = React.useRef<View | null>(null);

  React.useImperativeHandle(ref, () => ({
    openDrawer() {},
    closeDrawer() {},
  }));

  return (
    <View ref={innerRef} style={style}>
      {children}
    </View>
  );
});

DrawerLayout.displayName = 'HarmonyDrawerLayout';

const gestureHandlerModule = {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  Swipeable,
  ScrollView,
  FlatList,
  RectButton,
  BorderlessButton,
  BaseButton,
  PanGestureHandler,
  TapGestureHandler,
  NativeViewGestureHandler,
  FlingGestureHandler,
  RotationGestureHandler,
  PinchGestureHandler,
  ForceTouchGestureHandler,
  LongPressGestureHandler,
  State,
  Directions,
  gestureHandlerRootHOC,
  createNativeWrapper,
  DrawerLayout,
};

export default gestureHandlerModule;
