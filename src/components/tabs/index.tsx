import { Tabs, TabsProps } from '@ant-design/react-native';
import React from 'react';

import useVisualScheme from '@/store/visualScheme';

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
