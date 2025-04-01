import * as React from 'react';
import { StyleSheet } from 'react-native';

import View from '@/components/view';

import SelectStyle from '@/modules/selectStyle';
import SelectTheme from '@/modules/selectTheme';

import Nabvar from '../(courseTable)/component/Navbar';
export default function Theme() {
  const [pattern, setPattern] = React.useState(0);

  return (
    <View style={styles.container}>
      <Nabvar
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
