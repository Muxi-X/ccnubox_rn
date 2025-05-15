import * as React from 'react';
import { StyleSheet } from 'react-native';

// import TabBar from '@/components/tabbar';
import TabBar from '@/components/tabs';
import View from '@/components/view';

import SelectStyle from '@/modules/selectStyle';
import SelectTheme from '@/modules/selectTheme';

export default function Theme() {
  return (
    <View style={styles.container}>
      <TabBar
        tabs={[
          {
            title: '布局',
          },
          {
            title: '样式',
          },
        ]}
      >
        <SelectTheme />
        <SelectStyle />
      </TabBar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tab: {
    paddingVertical: 40,
  },
});
