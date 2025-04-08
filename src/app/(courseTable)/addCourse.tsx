import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import TabBar from '@/components/tabbar';

import { ManualAdd } from './components/ManualAdd';
import { SearchAdd } from './components/SearchAdd';

export default function AddCourse() {
  const [pattern, setPattern] = React.useState(0);

  return (
    <View style={styles.container}>
      <TabBar
        navText={['自主添加', '搜索添加']}
        pattern={pattern}
        setPattern={setPattern}
      />
      {pattern === 0 ? (
        <ManualAdd pageText="course" buttonText="添加课程" />
      ) : (
        <SearchAdd />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
});
