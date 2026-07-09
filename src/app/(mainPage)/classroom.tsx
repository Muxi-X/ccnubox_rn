import { router, useFocusEffect } from 'expo-router';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useClassroomData } from '@/hooks';

import Modal from '@/components/modal';
import Text from '@/components/text';

import { useClassroomWarningStore } from '@/store/classroom';
import { useHeaderRightStore } from '@/store/headerRight';
import useVisualScheme from '@/store/visualScheme';

import StarIcon from '@/assets/icons/star.svg';
import { ClassroomContent } from '@/modules/mainPage/components/classroom';

export default function Classroom() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const setHeaderRight = useHeaderRightStore(state => state.setContent);

  const classroomProps = useClassroomData();

  const warningHydrated = useClassroomWarningStore(state => state.hydrated);
  const warningShown = useClassroomWarningStore(state => state.warningShown);
  const setWarningShown = useClassroomWarningStore(
    state => state.setWarningShown
  );

  React.useEffect(() => {
    if (!warningHydrated || warningShown) return;
    Modal.show({
      title: '温馨提示',
      children:
        '空闲教室数据来自学校官方平台，但仍可能更新不及时或出现错误，请以实际教室使用情况为准。',
      confirmText: '我知道了',
      mode: 'middle',
      onConfirm: () => setWarningShown(true),
      onClose: () => setWarningShown(true),
    });
  }, [warningHydrated, warningShown, setWarningShown]);

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

  useFocusEffect(
    React.useCallback(() => {
      setHeaderRight(starButton);
      return () => setHeaderRight(null);
    }, [starButton, setHeaderRight])
  );

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
