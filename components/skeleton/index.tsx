import { LinearGradient } from 'expo-linear-gradient';
import React, { FC, memo, ReactElement, useMemo, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

import { SkeletonType, SkeletonViewType } from '@/components/skeleton/type';
import { keyGenerator } from '@/utils/autoKey';

/**
 * 骨架屏组件
 * @param loading {boolean} 是否显示骨架屏
 * @param children {ReactElement} 渲染组件
 * @constructor
 */
const SkeletonLoader: FC<SkeletonType> = ({ loading, children }) => {
  const [layout, setLayout] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const translateX = useMemo(() => {
    return new Animated.Value(layout ? -layout.width * 1.5 : 0);
  }, [layout?.width]);

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
    if (width && height) {
      console.log(width, height);
      setLayout({ width, height });
    }
  };

  if (loading && layout) {
    if (React.isValidElement(children)) {
      const childStyle = (children as ReactElement).props?.style || {};
      return (
        <View style={[childStyle, styles.skeletons, layout]}>
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

  return (
    children &&
    React.cloneElement(children as ReactElement, { onLayout: handleLayout })
  );
};
const styles = StyleSheet.create({
  skeletons: {
    position: 'relative',
    backgroundColor: '#ededed',
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
 * @param loading {boolean} 所有子组件是否呈现骨架屏
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
