import { Tab, TabView } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import useVisualScheme from '@/store/visualScheme';

/**
 * TabBar组件
 * 对RNEUI Tab + TabView 的二次封装，基本使用方法与原AntD Tabs一致
 * - 字体大小18px，字重500
 * - 激活状态文字颜色为紫色(#9379F6)
 * - 下划线样式为紫色，宽度30%，左右margin 10%
 * - 背景色跟随主题
 * - Tab高度固定为60px
 * @param props - TabsProps类型，继承自AntD Tabs的所有属性
 * @param props.children - Tab内容
 * @param props.renderTabBar - 自定义TabBar渲染函数，默认使用DefaultTabBar
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
  const tabCount = tabs?.length || 1;

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
      //下划线绝对定位，从第一个tab开始
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
      <TabView
        value={clampedActiveIndex}
        onChange={handleChange}
        disableSwipe={!swipeable}
        containerStyle={styles.tabView}
      >
        {children}
      </TabView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabView: { flex: 1 },
});

export default TabBar;
