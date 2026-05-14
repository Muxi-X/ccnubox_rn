import React from 'react';
import { Animated, View, type ViewProps } from 'react-native';

type ScreenComponentProps = ViewProps & {
  children?: React.ReactNode;
};

const createViewWrapper = (displayName: string) => {
  const WrappedView = React.forwardRef<View, ScreenComponentProps>(
    (
      {
        children,
        style,
        testID,
        accessibilityLabel,
        accessibilityRole,
        accessible,
      },
      ref
    ) => (
      <View
        ref={ref}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessible={accessible}
        style={style}
        testID={testID}
      >
        {children}
      </View>
    )
  );

  WrappedView.displayName = displayName;
  return WrappedView;
};

const Screen = createViewWrapper('HarmonyScreen');
const InnerScreen = createViewWrapper('HarmonyInnerScreen');
const ScreenContainer = createViewWrapper('HarmonyScreenContainer');
const ScreenStack = createViewWrapper('HarmonyScreenStack');
const ScreenStackItem = createViewWrapper('HarmonyScreenStackItem');
const ScreenFooter = createViewWrapper('HarmonyScreenFooter');
const ScreenContentWrapper = createViewWrapper('HarmonyScreenContentWrapper');
const FullWindowOverlay = createViewWrapper('HarmonyFullWindowOverlay');
const ScreenStackHeaderConfig = createViewWrapper(
  'HarmonyScreenStackHeaderConfig'
);
const ScreenStackHeaderSubview = createViewWrapper(
  'HarmonyScreenStackHeaderSubview'
);
const ScreenStackHeaderLeftView = createViewWrapper(
  'HarmonyScreenStackHeaderLeftView'
);
const ScreenStackHeaderCenterView = createViewWrapper(
  'HarmonyScreenStackHeaderCenterView'
);
const ScreenStackHeaderRightView = createViewWrapper(
  'HarmonyScreenStackHeaderRightView'
);
const ScreenStackHeaderBackButtonImage = createViewWrapper(
  'HarmonyScreenStackHeaderBackButtonImage'
);
const ScreenStackHeaderSearchBarView = createViewWrapper(
  'HarmonyScreenStackHeaderSearchBarView'
);
const BottomTabs = createViewWrapper('HarmonyBottomTabs');
const BottomTabsScreen = createViewWrapper('HarmonyBottomTabsScreen');
const ScreenStackHost = createViewWrapper('HarmonyScreenStackHost');
const StackScreen = createViewWrapper('HarmonyStackScreen');
const SplitViewHost = createViewWrapper('HarmonySplitViewHost');
const SplitViewScreen = createViewWrapper('HarmonySplitViewScreen');

const SearchBar = React.forwardRef<View, ScreenComponentProps>(() => null);
SearchBar.displayName = 'HarmonySearchBar';

export const ScreenContext = React.createContext(null);

export const enableScreens = () => false;
export const enableFreeze = () => false;
export const screensEnabled = () => false;
export const freezeEnabled = () => false;

export const compatibilityFlags = {};
export const featureFlags = {};

export const isSearchBarAvailableForCurrentPlatform = false;
export const executeNativeBackPress = () => false;

export const useTransitionProgress = () =>
  React.useMemo(
    () => ({
      progress: new Animated.Value(1),
      closing: new Animated.Value(0),
      goingForward: new Animated.Value(1),
    }),
    []
  );

export const useReanimatedTransitionProgress = useTransitionProgress;

export const StackScreenLifecycleState = {
  INITIAL: 0,
  APPEARING: 1,
  APPEARED: 2,
  DISAPPEARING: 3,
  DISAPPEARED: 4,
};

const reactNativeScreensModule = {
  enableScreens,
  enableFreeze,
  screensEnabled,
  freezeEnabled,
  Screen,
  InnerScreen,
  ScreenContext,
  ScreenContainer,
  ScreenStack,
  ScreenStackItem,
  ScreenStackHeaderConfig,
  ScreenStackHeaderSubview,
  ScreenStackHeaderLeftView,
  ScreenStackHeaderCenterView,
  ScreenStackHeaderRightView,
  ScreenStackHeaderBackButtonImage,
  ScreenStackHeaderSearchBarView,
  SearchBar,
  ScreenFooter,
  ScreenContentWrapper,
  FullWindowOverlay,
  isSearchBarAvailableForCurrentPlatform,
  executeNativeBackPress,
  compatibilityFlags,
  featureFlags,
  useTransitionProgress,
  useReanimatedTransitionProgress,
  BottomTabs,
  BottomTabsScreen,
  ScreenStackHost,
  StackScreen,
  StackScreenLifecycleState,
  SplitViewHost,
  SplitViewScreen,
};

export {
  BottomTabs,
  BottomTabsScreen,
  FullWindowOverlay,
  InnerScreen,
  Screen,
  ScreenContainer,
  ScreenContentWrapper,
  ScreenFooter,
  ScreenStack,
  ScreenStackHeaderBackButtonImage,
  ScreenStackHeaderCenterView,
  ScreenStackHeaderConfig,
  ScreenStackHeaderLeftView,
  ScreenStackHeaderRightView,
  ScreenStackHeaderSearchBarView,
  ScreenStackHeaderSubview,
  ScreenStackHost,
  ScreenStackItem,
  SearchBar,
  SplitViewHost,
  SplitViewScreen,
  StackScreen,
};

export default reactNativeScreensModule;
