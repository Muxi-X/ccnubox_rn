import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import TabBar from '@/components/tabs';
import View from '@/components/view';

import OtherStyle from '@/modules/setting/components/otherStyle';
import SelectStyle from '@/modules/setting/components/selectStyle';

export default function Theme() {
  const [swipeable, setSwipeable] = useState(true);
  const disableSwipe = useCallback(() => setSwipeable(false), []);
  const enableSwipe = useCallback(() => setSwipeable(true), []);

  return (
    <View style={styles.container}>
      <TabBar
        swipeable={swipeable}
        tabs={[{ title: '课表样式' }, { title: '颜色主题' }]}
      >
        <ScrollView
          style={styles.scrollTab}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <OtherStyle
            onSliderTouchStart={disableSwipe}
            onSliderTouchEnd={enableSwipe}
          />
        </ScrollView>
        <SelectStyle />
      </TabBar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollTab: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
});
