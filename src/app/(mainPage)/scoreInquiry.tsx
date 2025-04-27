import { Tabs } from '@ant-design/react-native';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import CheckGrades from '@/modules/mainPage/components/checkgrades';
import CourseTree from '@/modules/mainPage/components/courseTree';

const tabs = [{ title: '查询学分绩' }, { title: '已修学分' }];

const ScoreInquiry = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  return (
    <View style={[styles.container, currentStyle?.background_style]}>
      <Tabs
        tabs={tabs}
        tabBarTextStyle={{ fontSize: 18, fontWeight: 500 }}
        tabBarActiveTextColor="#9379F6"
        tabBarUnderlineStyle={{
          backgroundColor: '#9379F6',
          marginHorizontal: '10%',
          width: '30%',
        }}
      >
        <View style={styles.content}>
          <CheckGrades />
        </View>
        <View style={styles.content}>
          <CourseTree />
        </View>
      </Tabs>
    </View>
  );
};

export default ScoreInquiry;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#FFF',
  },
  content: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
});
