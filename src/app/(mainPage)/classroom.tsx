import { StyleSheet, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import {
  ClassroomContent,
  useClassroomData,
} from '@/modules/mainPage/components/classroom';
import { commonStyles } from '@/styles/common';

export default function Classroom() {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  const classroomProps = useClassroomData();

  return (
    <>
      <View style={styles.container}>
        {/* 教室内容 */}
        <ClassroomContent {...classroomProps} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: commonStyles.fontLarge.fontSize,
    height: commonStyles.fontLarge.fontSize,
  },
  headerTitle: {
    fontSize: commonStyles.fontLarge.fontSize,
    fontWeight: '600',
    marginLeft: 20,
  },
  starButton: {
    width: 27,
    height: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});
