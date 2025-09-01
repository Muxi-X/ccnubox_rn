import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import TabBar from '@/components/tabs';

import useVisualScheme from '@/store/visualScheme';

import { ManualAdd } from '@/modules/courseTable/components/ManualAdd';
import { SearchAdd } from '@/modules/courseTable/components/SearchAdd';

export default function AddCourse() {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  return (
    <View style={[styles.container, currentStyle?.background_style]}>
      <TabBar
        tabs={[
          {
            title: '自主添加',
          },
          {
            title: '搜索添加',
          },
        ]}
      />
      <ManualAdd pageText="course" buttonText="添加课程" />
      <SearchAdd />
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
