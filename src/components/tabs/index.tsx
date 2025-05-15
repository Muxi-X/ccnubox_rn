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
  return (
    <Tabs
      {...props}
      renderTabBar={tabProps => (
        <Tabs.DefaultTabBar
          {...tabProps}
          tabBarTextStyle={{
            fontSize: 18,
            fontWeight: 500,
          }}
          tabBarInactiveTextColor={currentStyle?.text_style?.color as string}
          tabBarActiveTextColor="#9379F6"
          tabBarUnderlineStyle={{
            backgroundColor: '#9379F6',
            marginHorizontal: '10%',
            width: '30%',
          }}
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
    >
      {props.children}
    </Tabs>
  );
};

export default TabBar;
