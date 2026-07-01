import { router } from 'expo-router';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import Text from '@/components/text';

import { useHeaderRightStore } from '@/store/headerRight';
import useVisualScheme from '@/store/visualScheme';

import StarIcon from '@/assets/icons/star.svg';
import {
  ClassroomContent,
  useClassroomData,
} from '@/modules/mainPage/components/classroom';

export default function Classroom() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const setHeaderRight = useHeaderRightStore(state => state.setContent);

  const classroomProps = useClassroomData();

  const starButton = React.useMemo(
    () => (
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/(mainPage)/classroomStar' })}
        style={styles.starButton}
      >
        <StarIcon width={24} height={24} color="#FFD700" />
        <Text style={[styles.starLabel, currentStyle?.header_text_style]}>
          我的收藏
        </Text>
      </TouchableOpacity>
    ),
    [currentStyle?.header_text_style]
  );

  React.useEffect(() => {
    setHeaderRight(starButton);
    return () => setHeaderRight(null);
  }, [starButton, setHeaderRight]);

  return (
    <View style={styles.container}>
      <ClassroomContent {...classroomProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  starButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starLabel: {
    fontSize: 10,
  },
});
