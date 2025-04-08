import * as React from 'react';
import { StyleSheet } from 'react-native';

import TabBar from '@/components/tabbar';
import View from '@/components/view';

import SelectStyle from '@/modules/selectStyle';
import SelectTheme from '@/modules/selectTheme';
export default function Theme() {
  const [pattern, setPattern] = React.useState(0);

  return (
    <View style={styles.container}>
      <TabBar
        navText={['布局', '样式']}
        pattern={pattern}
        setPattern={setPattern}
      />
      {pattern === 0 ? <SelectTheme /> : <SelectStyle />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
