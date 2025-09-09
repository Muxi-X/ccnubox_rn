import { router } from 'expo-router';
import * as React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import StarIcon from '@/assets/icons/star.svg';
import Text from '@/components/text';
import {
  ClassroomContent,
  useClassroomData,
} from '@/modules/mainPage/components/classroom';

import useVisualScheme from '@/store/visualScheme';
import { commonStyles } from '@/styles/common';

export default function Classroom() {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  // 使用共享的教室数据管理Hook
  const classroomProps = useClassroomData();

  return (
    <>
      <SafeAreaView style={currentStyle?.header_background_style}>
        {/* 自定义头部 */}
        <View style={[styles.header, currentStyle?.header_background_style]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <Image
                style={styles.backIcon}
                source={require('../../assets/images/arrow-left.png')}
              />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, currentStyle?.header_text_style]}>
              空闲教室
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/(mainPage)/classroomStar',
                });
              }}
              style={styles.starButton}
            >
              <StarIcon width={24} height={24} color="#FFD700" />
              <Text style={[{ fontSize: 6 }, currentStyle?.header_text_style]}>
                我的收藏
              </Text>
            </TouchableOpacity>
            6{' '}
          </View>
        </View>
      </SafeAreaView>

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
