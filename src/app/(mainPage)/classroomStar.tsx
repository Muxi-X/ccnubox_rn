import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ClassroomContent,
  useClassroomData,
} from '@/modules/mainPage/components/classroom';

import useVisualScheme from '@/store/visualScheme';

export default function ClassroomStar() {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  // 使用共享的教室数据管理Hook，设置为过滤收藏的教室
  const classroomProps = useClassroomData(true);

  // 空状态配置
  const emptyStateConfig = {
    noStarredTitle: '还没有收藏任何教室',
    noStarredSubtitle: '去空闲教室页面收藏一些教室吧~',
    noDataTitle: '当前条件下没有收藏的教室',
    noDataSubtitle: '请尝试更换地点或楼层查看',
  };

  return (
    <View style={[styles.container, currentStyle?.header_background_style]}>
      <ClassroomContent
        {...classroomProps}
        emptyStateConfig={emptyStateConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
