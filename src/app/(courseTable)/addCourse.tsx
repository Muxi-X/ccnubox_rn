import { useRouter } from 'expo-router';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import { ManualAdd } from '@/modules/courseTable/components/ManualAdd';

export default function AddCourse() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const router = useRouter();

  const handleSuccess = () => {
    // 添加课程成功后返回课表页面，用户可以看到更新后的课表
    router.back();
  };

  return (
    <View style={[styles.container, currentStyle?.background_style]}>
      {/* <TabBar
        tabs={[
          {
            title: '自主添加',
          },
          {
            title: '搜索添加',
          },
        ]}
      >
        <ManualAdd pageText="course" buttonText="添加课程" />
        <SearchAdd />
      </TabBar> */}
      <ManualAdd
        pageText="course"
        buttonText="添加课程"
        onSuccess={handleSuccess}
      />
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
