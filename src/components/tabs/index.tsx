import { Tab } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import useVisualScheme from '@/store/visualScheme';

/**
 * TabBar组件
 * 对 RNEUI Tab 的二次封装与切页动画组件
 * - 字体大小18px，字重500
 * - 激活状态文字颜色为紫色(#9379F6)
 * - 下划线样式为紫色，宽度30%，左右margin 10%
 * - 背景色跟随主题
 * - Tab高度固定为60px
 */
export interface TabData {
  title: string;
  key?: string;
}

export interface TabBarProps {
  tabs?: TabData[];
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  swipeable?: boolean;
  onChange?: (tab: TabData | undefined, index: number) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  children,
  style,
  swipeable = true,
  onChange,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const themeName = useVisualScheme(state => state.themeName);
  const [activeIndex, setActiveIndex] = useState(0);

  // 解包 children（如果包含 Fragment 或数组）
  const childArray = React.useMemo(() => {
    const rawChildren = React.Children.toArray(children);
    if (
      rawChildren.length === 1 &&
      React.isValidElement(rawChildren[0]) &&
      rawChildren[0].type === React.Fragment
    ) {
      return React.Children.toArray(
        (rawChildren[0].props as { children?: React.ReactNode }).children
      );
    }
    return rawChildren;
  }, [children]);

  const tabCount = tabs?.length || childArray.length || 1;

  useEffect(() => {
    setActiveIndex(prev => Math.min(prev, tabCount - 1));
  }, [tabCount]);

  const clampedActiveIndex = Math.min(activeIndex, tabCount - 1);

  const handleChange = (index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), tabCount - 1);
    setActiveIndex(safeIndex);
    onChange?.(tabs?.[safeIndex], safeIndex);
  };

  const getIndicatorStyle = () => {
    const singleTabWidth = 100 / tabCount;
    const underlineWidth = singleTabWidth * 0.65;
    const margin = (singleTabWidth - underlineWidth) / 2;

    return {
      backgroundColor: '#9379F6',
      marginHorizontal: `${margin}%`,
      width: `${underlineWidth}%`,
      height: 3,
      left: 0,
    } as const;
  };

  const getTitleStyle = (active: boolean): TextStyle => ({
    fontSize: 18,
    fontWeight: 500,
    color: active ? '#9379F6' : themeName === 'dark' ? '#969696' : '#3D3D3D',
  });

  return (
    <View style={[styles.container, style]}>
      <Tab
        value={clampedActiveIndex}
        onChange={handleChange}
        variant="default"
        style={{
          backgroundColor: currentStyle?.background_style?.backgroundColor,
        }}
        indicatorStyle={getIndicatorStyle()}
        buttonStyle={{
          height: 60,
          backgroundColor: 'transparent',
        }}
        titleStyle={getTitleStyle}
      >
        {(tabs || []).map(tab => (
          <Tab.Item key={tab.key ?? tab.title} title={tab.title} />
        ))}
      </Tab>
      <CustomTabView
        value={clampedActiveIndex}
        onChange={handleChange}
        disableSwipe={!swipeable}
      >
        {childArray}
      </CustomTabView>
    </View>
  );
};

/**
 * CustomTabView 组件
 *
 * 【设计说明与手势冲突解决】
 * 1. 背景问题：
 *    之前采用 PanResponder 实现切页时，iOS 原生 Stack 导航手势（UIScreenEdgePanGestureRecognizer）
 *    会在用户从左往右滑动（处于非首 Tab 视图试图滑回左侧 Tab 时）直接抢占手势并触发页面 Stack Pop（返回上一页）。
 * 2. 解决方案：
 *    重构为原生水平 ScrollView (horizontal + pagingEnabled)。在 iOS UIKit 中，当 UIScrollView 处于
 *    非 0 偏移量时，UIKit 手势协商机制会将水平滑动优先分配给 UIScrollView，从而防止误触 iOS 原生 Stack 的侧滑返回。
 * 3. 交互与同步控制：
 *    - 点击 Tab 头切换：通过 useEffect 监听 value 变化并调用 scrollViewRef.current.scrollTo(...) 动效切页；
 *    - 手势滑动切换：监听 onMomentumScrollEnd 与 onScrollEndDrag 两个事件，准确捕捉快滑与慢拖结束时的偏移量并回调 onChange；
 *    - 手势禁用：支持 scrollEnabled={!disableSwipe}，在页面内有 Slider 等横向手势冲突控件时可动态关闭 ScrollView 滑动。
 */
interface CustomTabViewProps {
  value: number;
  onChange: (index: number) => void;
  disableSwipe?: boolean;
  children: React.ReactNode[];
}

const CustomTabView: React.FC<CustomTabViewProps> = ({
  value,
  onChange,
  disableSwipe = false,
  children,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const currentIndex = React.useRef(value);
  const currentX = React.useRef(0);
  const isInitialRender = React.useRef(true);

  const childCount = children.length;

  // 保持 currentIndex 引用最新，避免闭包捕获旧值
  useEffect(() => {
    currentIndex.current = value;
  }, [value]);

  // 当外部选中的 activeIndex (value) 变化时，驱动 ScrollView 滚动到对应页面
  useEffect(() => {
    if (containerWidth > 0 && scrollViewRef.current) {
      const targetX = value * containerWidth;
      if (isInitialRender.current) {
        // 首次布局完成，无动画直接定位到初始页
        isInitialRender.current = false;
        scrollViewRef.current.scrollTo({ x: targetX, animated: false });
        currentX.current = targetX;
      } else if (Math.abs(currentX.current - targetX) > 5) {
        // 仅在当前滚动位置与目标位置差距大于 5px 时执行动画，避免手动滑动完成后触发二次冗余滚动动画
        scrollViewRef.current.scrollTo({ x: targetX, animated: true });
        currentX.current = targetX;
      }
    }
  }, [value, containerWidth]);

  /**
   * 滑动结束处理逻辑（兼容惯性结束与无惯性慢速拖拽结束）
   */
  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth <= 0) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    currentX.current = offsetX;
    const newIndex = Math.round(offsetX / containerWidth);
    const clampedIndex = Math.min(Math.max(newIndex, 0), childCount - 1);

    if (clampedIndex !== currentIndex.current) {
      currentIndex.current = clampedIndex;
      onChange(clampedIndex);
    }
  };

  return (
    <View
      style={styles.tabViewContainer}
      onLayout={e => {
        const width = e.nativeEvent.layout.width;
        if (width > 0 && width !== containerWidth) {
          setContainerWidth(width);
        }
      }}
    >
      {containerWidth > 0 && (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          scrollEnabled={!disableSwipe}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          directionalLockEnabled
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          style={styles.scrollView}
          contentContainerStyle={{ width: containerWidth * childCount }}
        >
          {children.map((child, index) => (
            <View
              key={index}
              style={[styles.tabViewPage, { width: containerWidth }]}
            >
              {child}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabViewContainer: { flex: 1, overflow: 'hidden' },
  scrollView: { flex: 1 },
  tabViewPage: { flex: 1 },
});

export default TabBar;
