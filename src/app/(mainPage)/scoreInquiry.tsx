import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import TabBar from '@/components/tabs';

import useVisualScheme from '@/store/visualScheme';

import CheckGrades from '@/modules/mainPage/components/checkgrades';
import CourseTree from '@/modules/mainPage/components/courseTree';

const ScoreInquiry = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  const tabs = [
    {
      title: '查算学分绩',
    },
    {
      title: '已修学分',
    },
  ];

  return (
    <View style={[styles.container, currentStyle?.background_style]}>
      <TabBar tabs={tabs}>
        <View style={styles.content}>
          <CheckGrades />
        </View>
        <View style={styles.content}>
          <CourseTree />
        </View>
      </TabBar>
    </View>
  );
};

export default ScoreInquiry;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
