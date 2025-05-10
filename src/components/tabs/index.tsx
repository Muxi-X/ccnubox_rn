import { Tabs, TabsProps } from '@ant-design/react-native';
import React from 'react';

export const TabBar: React.FC<TabsProps> = props => {
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
          tabBarActiveTextColor="#9379F6"
          tabBarUnderlineStyle={{
            backgroundColor: '#9379F6',
            marginHorizontal: '10%',
            width: '30%',
          }}
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
