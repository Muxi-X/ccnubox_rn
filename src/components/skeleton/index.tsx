import { useIsFocused } from '@react-navigation/core';
import { LinearGradient } from 'expo-linear-gradient';
import React, {
    FC,
    memo,
    ReactElement,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import AnimatedOpacity from '@/components/animatedView/AnimatedOpacity';
import { SkeletonType, SkeletonViewType } from '@/components/skeleton/type';

import useVisualScheme from '@/store/visualScheme';

import { keyGenerator } from '@/utils';
import globalEventBus from '@/utils/eventBus';

/**
 * 骨架屏组件
 * @param loading 是否显示骨架屏
 * @param children 渲染组件
 * @param width 钉死的高度（可选）
 * @param height 钉死的高度（可选）
 * @constructor
 */
const SkeletonLoader: FC<SkeletonType> = ({
  children,
  width: propWidth,
  height: propHeight,
}) => {
  const [layout, setLayout] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [loading, setLoading] = useState<boolean>(true);
  const translateX = useMemo(() => {
    return new Animated.Value(layout ? -layout.width * 1.5 : 0);
  }, [layout?.width]);
  const isFocused = useIsFocused();
  // 监听请求完成事件
  useEffect(() => {
    globalEventBus.on('request_complete', () => {
      isFocused && setLoading(false);
    });
  }, []);
  React.useEffect(() => {
    layout &&
      Animated.loop(
        Animated.timing(translateX, {
          toValue: layout.width * 1.25,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
  }, [translateX, layout]);

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width: width ?? propWidth, height: height ?? propHeight });
  };

  const skeleton = useMemo(() => {
    if (loading && layout) {
      if (React.isValidElement(children)) {
        const childStyle = (children as ReactElement).props?.style || {};
        return (
          <View
            style={[
              childStyle,
              styles.skeletons,
              currentStyle?.skeleton_background_style,
              layout,
            ]}
          >
            <Animated.View
              style={[
                styles.shimmer,
                {
                  transform: [{ translateX }],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(216, 216, 216, 0.253)',
                  'transparent',
                ]}
                style={styles.gradient}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 2, y: 0.5 }}
              />
            </Animated.View>
          </View>
        );
      }
      return null;
    }
  }, [loading, layout]);

  return (
    <>
      {skeleton}
      {/* 避免一开始闪屏 */}
      <AnimatedOpacity
        trigger={!loading}
        duration={1200}
        style={{
          position: loading ? 'absolute' : 'relative',
          overflow: 'hidden',
        }}
      >
        {children &&
          React.cloneElement(children as ReactElement, {
            ...children.props,
            onLayout: handleLayout,
          })}
      </AnimatedOpacity>
    </>
  );
};
const styles = StyleSheet.create({
  skeletons: {
    position: 'relative',
    overflow: 'hidden',
    minWidth: 40,
    minHeight: 17,
    borderRadius: 10,
  },
  shimmer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
});

export default memo(SkeletonLoader);

/**
 * 给所有子组件都加上骨架屏
 * @param loading 所有子组件是否呈现骨架屏
 * @param children 子组件
 * @param style 样式
 * @constructor
 */
export const SkeletonView: FC<SkeletonViewType> = ({ loading, children }) => {
  const wrappedChildren = React.Children.map(children, child => {
    return (
      <SkeletonLoader
        loading={loading}
        key={keyGenerator.next().value as unknown as number}
      >
        {React.cloneElement(child as ReactElement)}
      </SkeletonLoader>
    );
  });

  return <View>{wrappedChildren}</View>;
};
