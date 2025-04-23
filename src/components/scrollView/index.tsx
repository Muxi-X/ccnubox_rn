import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  LayoutRectangle,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScrollableViewProps } from '@/components/scrollView/type';

import { commonColors } from '@/styles/common';
import globalEventBus from '@/utils/eventBus';

import Toast from '../toast';

const REFRESH_THRESHOLD = 100; // 触发刷新的阈值

// 刷新状态类型定义
type RefreshState = 'pull' | 'release' | 'refreshing';

const ScrollLikeView = React.forwardRef<View, ScrollableViewProps>(
  (props, ref) => {
    const {
      onScrollToBottom,
      stickyTop,
      stickyLeft,
      children,
      style,
      cornerStyle,
      onRefresh,
      collapsable,
      enableScrolling = true, // 默认启用滚动
    } = props;

    // Animated values
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const backHeight = useRef(new Animated.Value(0)).current;
    const cornerWidth = useRef(new Animated.Value(0)).current;
    const cornerHeight = useRef(new Animated.Value(0)).current;

    // State values
    const [refreshState, setRefreshState] = useState<RefreshState>('pull');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentBackHeight, setCurrentBackHeight] = useState(0);
    const [currentTranslateX, setCurrentTranslateX] = useState(0);
    const [currentTranslateY, setCurrentTranslateY] = useState(0);
    const [containerSize, setContainerSize] = useState<LayoutRectangle>({
      x: 0,
      y: 0,
      height: 0,
      width: 0,
    });
    const [wrapperSize, setWrapperSize] = useState<LayoutRectangle>({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

    // Refs for tracking gesture state
    const startPos = useRef({ x: 0, y: 0 });
    const prevTranslateX = useRef(0);
    const shouldRefresh = useRef(true);

    // Set up value listeners
    useEffect(() => {
      const backHeightListener = backHeight.addListener(({ value }) => {
        setCurrentBackHeight(value);
      });
      const translateXListener = translateX.addListener(({ value }) => {
        setCurrentTranslateX(value);
      });
      const translateYListener = translateY.addListener(({ value }) => {
        setCurrentTranslateY(value);
      });

      return () => {
        backHeight.removeListener(backHeightListener);
        translateX.removeListener(translateXListener);
        translateY.removeListener(translateYListener);
      };
    }, [backHeight, translateX, translateY]);

    // Reset scroll position effect
    useEffect(() => {
      const resetScrollPosition = () => {
        translateX.setValue(0);
        translateY.setValue(0);
      };

      globalEventBus.on('ResetScrollPosition', resetScrollPosition);

      return () => {
        globalEventBus.off('ResetScrollPosition', resetScrollPosition);
      };
    }, [translateX, translateY]);

    const onReachTopEnd = () => {
      if (!onRefresh) return;

      onRefresh(
        () => {
          Toast.show({
            text: '刷新成功',
            icon: 'success',
          });
          Animated.timing(backHeight, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }).start();

          setTimeout(() => {
            setRefreshState('pull');
            setIsRefreshing(false);
          }, 2000);
        },
        () => {
          Toast.show({
            text: '刷新失败',
            icon: 'fail',
          });

          Animated.timing(backHeight, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }).start();

          setTimeout(() => {
            setRefreshState('pull');
            setIsRefreshing(false);
          }, 2000);
        }
      );
    };

    const onReachBottomEnd = () => {
      onScrollToBottom && onScrollToBottom();
    };

    const MIN_PULL_THRESHOLD = 30;

    const handlePullToRefresh = (gestureState: { dy: number }) => {
      if (isRefreshing) return;

      if (gestureState.dy <= 0) {
        if (currentBackHeight > 0) {
          backHeight.setValue(0);
          setRefreshState('pull');
        }
        return;
      }

      if (shouldRefresh.current) {
        const dampedTranslation = gestureState.dy * 0.7;

        if (dampedTranslation >= MIN_PULL_THRESHOLD) {
          const newHeight = Math.min(
            Math.floor((dampedTranslation - MIN_PULL_THRESHOLD) / 2) * 2,
            REFRESH_THRESHOLD
          );

          backHeight.setValue(newHeight);

          if (
            dampedTranslation > REFRESH_THRESHOLD &&
            refreshState !== 'release'
          ) {
            setRefreshState('release');
          } else if (
            dampedTranslation <= REFRESH_THRESHOLD &&
            refreshState === 'release'
          ) {
            setRefreshState('pull');
          }
        } else if (currentBackHeight > 0) {
          backHeight.setValue(0);
        }
      }
    };

    const handleRefreshComplete = (gestureState: { dy: number }) => {
      if (isRefreshing) return;

      prevTranslateX.current = 0;
      shouldRefresh.current = true;

      if (gestureState.dy <= 0) {
        if (currentBackHeight > 0) {
          backHeight.setValue(0);
          setRefreshState('pull');
          return;
        }
      }

      const dampedTranslation = gestureState.dy * 0.7;

      if (
        dampedTranslation > REFRESH_THRESHOLD &&
        dampedTranslation >= MIN_PULL_THRESHOLD
      ) {
        setRefreshState('refreshing');
        setIsRefreshing(true);
        backHeight.setValue(REFRESH_THRESHOLD);
        onReachTopEnd();
      } else if (currentBackHeight > 0) {
        setRefreshState('pull');
        Animated.timing(backHeight, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }).start();
        setIsRefreshing(false);
      }
    };

    // Create pan responder
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: () => enableScrolling && !isRefreshing,
        onPanResponderGrant: () => {
          startPos.current = {
            x: currentTranslateX,
            y: currentTranslateY,
          };
        },
        onPanResponderMove: (_, gestureState) => {
          if (isRefreshing) return;

          if (Math.abs(gestureState.dx) > 80) {
            shouldRefresh.current = false;
          }

          handlePullToRefresh(gestureState);

          if (enableScrolling) {
            const newTranslateX = Math.min(
              0,
              Math.max(
                startPos.current.x + gestureState.dx,
                wrapperSize.width - containerSize.width
              )
            );

            const newTranslateY = Math.min(
              0,
              Math.max(
                startPos.current.y + gestureState.dy,
                wrapperSize.height - containerSize.height
              )
            );

            translateX.setValue(newTranslateX);
            translateY.setValue(newTranslateY);

            // Check if reached bottom
            if (newTranslateY <= wrapperSize.height - containerSize.height) {
              onReachBottomEnd();
            }
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (isRefreshing) return;
          handleRefreshComplete(gestureState);
        },
      })
    ).current;

    const refreshTextMap = {
      pull: '下拉刷新课表',
      pullMore: '继续下拉刷新课表',
      release: '松开即可刷新',
      refreshing: '刷新中...',
    };

    const handleChildLayout = (event: LayoutChangeEvent) => {
      const { layout } = event.nativeEvent;
      setContainerSize(layout);
    };

    const animatedStyles = {
      wrapper: {
        transform: [{ translateX: translateX }, { translateY: translateY }],
      },
      stickyTopWrapper: {
        transform: [{ translateX: translateX }],
        marginLeft: cornerWidth,
      },
      stickyLeftWrapper: {
        transform: [{ translateY: translateY }],
      },
      corner: {
        height: cornerHeight,
        width: cornerWidth,
        top: backHeight,
      },
      content: {
        marginLeft: cornerWidth,
      },
    };

    return (
      <View
        style={[styles.largeWrapper, style]}
        ref={ref}
        collapsable={collapsable}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            {
              width: '100%',
              zIndex: 21,
              height: backHeight,
              transform: [{ translateY: 0 }],
              opacity: 1,
              backgroundColor: commonColors.purple,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <Text style={[styles.refreshText]}>
            {refreshState === 'refreshing'
              ? refreshTextMap.refreshing
              : refreshState === 'release'
                ? refreshTextMap.release
                : currentBackHeight > REFRESH_THRESHOLD * 0.5
                  ? refreshTextMap.pullMore
                  : refreshTextMap.pull}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.stickyTop,
            { width: containerSize.width },
            animatedStyles.stickyTopWrapper,
            { zIndex: 10 },
          ]}
          onLayout={layout => {
            cornerHeight.setValue(layout.nativeEvent.layout.height);
          }}
        >
          {stickyTop}
        </Animated.View>

        <Animated.View
          style={[
            cornerStyle,
            animatedStyles.corner,
            {
              position: 'absolute',
              left: 0,
              backgroundColor: commonColors.gray,
              zIndex: 20,
              ...cornerStyle,
            },
          ]}
        />

        <Animated.View
          style={{
            flexDirection: 'row',
            flex: 1,
          }}
        >
          <Animated.View
            onLayout={layout => {
              cornerWidth.setValue(layout.nativeEvent.layout.width);
            }}
            style={[
              styles.stickyLeft,
              { height: containerSize.height },
              animatedStyles.stickyLeftWrapper,
            ]}
          >
            {stickyLeft}
          </Animated.View>

          <Animated.View
            style={[styles.wrapper, animatedStyles.content]}
            onLayout={event => {
              const { layout } = event.nativeEvent;
              setWrapperSize(layout);
            }}
          >
            <Animated.View
              {...panResponder.panHandlers}
              style={[animatedStyles.wrapper]}
            >
              {children &&
                React.cloneElement(children, { onLayout: handleChildLayout })}
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
);

ScrollLikeView.displayName = 'ScrollLikeView';

const styles = StyleSheet.create({
  largeWrapper: {
    flex: 1,
    overflow: 'visible',
  },
  wrapper: {
    overflow: 'visible',
    flex: 1,
    zIndex: 2,
  },
  stickyTop: {
    position: 'relative',
    overflow: 'hidden',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  stickyLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexShrink: 0,
    flexGrow: 0,
    zIndex: 9,
  },
  stickyContent: {
    flexShrink: 0,
    flexGrow: 0,
  },
  text: {
    fontSize: 18,
  },
  refreshText: {
    color: commonColors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default memo(ScrollLikeView);
