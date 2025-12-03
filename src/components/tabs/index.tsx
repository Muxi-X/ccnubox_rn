import { Tabs, TabsProps } from '@ant-design/react-native';
import React from 'react';

import useVisualScheme from '@/store/visualScheme';

/**
 * TabBar组件
 * 对AntD Tabs的二次封装，基本使用方法与AntD Tabs一致
 * 主要添加了默认样式配置:
 * - 字体大小18px，字重500
 * - 激活状态文字颜色为紫色(#9379F6)
 * - 下划线样式为紫色，宽度30%，左右margin 10%
 * - 背景色跟随主题
 * - Tab高度固定为60px
 * @param props - TabsProps类型，继承自AntD Tabs的所有属性
 * @param props.children - Tab内容
 * @param props.renderTabBar - 自定义TabBar渲染函数，默认使用DefaultTabBar
 */
export const TabBar: React.FC<TabsProps> = props => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const themeName = useVisualScheme(state => state.themeName);
  const tabCount =
    props.tabs?.length || React.Children.count(props.children) || 2;

  const getUnderlineStyle = () => {
    const singleTabWidth = 100 / tabCount;
    const underlineWidth = singleTabWidth * 0.65;
    const margin = (singleTabWidth - underlineWidth) / 2;

    return {
      backgroundColor: '#9379F6',
      marginHorizontal: `${margin}%`,
      width: `${underlineWidth}%`,
      height: 3,
    } as const;
  };

  return (
    <Tabs
      styles={{
        topTabBarSplitLine: { borderBottomWidth: 0 },
      }}
      renderTabBar={tabProps => (
        <Tabs.DefaultTabBar
          {...tabProps}
          tabBarTextStyle={{
            fontSize: 18,
            fontWeight: 500,
          }}
          tabBarInactiveTextColor={themeName === 'dark' ? '#969696' : '#3D3D3D'}
          tabBarActiveTextColor="#9379F6"
          tabBarUnderlineStyle={getUnderlineStyle()}
          tabBarBackgroundColor={
            currentStyle?.background_style?.backgroundColor as string
          }
          styles={{
            tab: {
              height: 60,
            },
          }}
        ></Tabs.DefaultTabBar>
      )}
      {...props}
    >
      {props.children}
    </Tabs>
  );
};

export default TabBar;
