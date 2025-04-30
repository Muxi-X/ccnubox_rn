import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import TabBar from '@/components/tabbar';

import useVisualScheme from '@/store/visualScheme';

import CheckGrades from '@/modules/mainPage/components/checkgrades';
import CourseTree from '@/modules/mainPage/components/courseTree';

const navText = ['查算学分绩', '已修学分'];

const ScoreInquiry = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [pattern, setPattern] = React.useState(0);

  return (
    <View style={[styles.container, currentStyle?.background_style]}>
      <TabBar pattern={pattern} setPattern={setPattern} navText={navText} />
      <View style={styles.content}>
        {pattern === 0 ? <CheckGrades /> : <CourseTree />}
      </View>
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
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});
