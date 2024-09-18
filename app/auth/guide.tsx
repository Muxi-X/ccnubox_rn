import { Button, Icon, Toast } from '@ant-design/react-native';
import { router } from 'expo-router';
import { FC, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import AnimatedFade from '@/components/animatedView/AnimatedFade';
import AnimatedOpacity from '@/components/animatedView/AnimatedOpacity';
import Pagination from '@/components/pagination';
import { preloginGuide } from '@/constants/prelogin';
import useVisualScheme from '@/store/visualScheme';
import { LinearGradient } from 'expo-linear-gradient';

const PAGE_SWIPE_ANIMATION_DURATION = 450;
const Guide: FC = () => {
  return (
    <View style={styles.guide_wrap}>
      <PreLoginCard />
      <View></View>
    </View>
  );
};

export default Guide;

export const PreLoginCard: FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [toVisible, setToVisible] = useState<boolean>(true);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [reachedLastPage, setReachedLastPage] = useState<boolean>(false);
  const handleStart = () => {
    router.navigate('/auth/login');
  };
  // 跳转第几条
  const jump = (pageNum: number) => {
    if (pageNum > preloginGuide.length - 1 || pageNum < 0) {
      Toast.show({
        icon: <Icon name="coffee" style={{ marginBottom: 6 }}></Icon>,
        content: '别划啦',
      });
      return;
    }
    if (pageNum === preloginGuide.length - 1) setReachedLastPage(true);
    setActiveIndex(pageNum);
    setToVisible(false);
    setTimeout(() => {
      setToVisible(true);
    }, PAGE_SWIPE_ANIMATION_DURATION + 200);
  };
  const onSwipe = Gesture.Pan()
    .minDistance(20)
    .onEnd(event => {
      // 渐入渐出动画
      jump(activeIndex + (event.translationX < 0 ? 1 : -1));
    })
    .runOnJS(true);
  const handleChange = (current: number) => {
    jump(current);
  };
  return (
    <>
      <GestureDetector gesture={onSwipe}>
        <View style={styles.card_wrap}>
          <LinearGradient
            colors={[
              '#94A6FF',
              '#70F5FF',
              '#94A6FF',
              '#70F5FF',
              '#94A6FF',
              '#70F5FF',
              '#94A6FF',
            ]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            collapsable
          ></LinearGradient>
          <AnimatedOpacity
            toVisible={toVisible}
            duration={PAGE_SWIPE_ANIMATION_DURATION}
          >
            <Text>123123123</Text>
          </AnimatedOpacity>
        </View>
      </GestureDetector>
      <Pagination
        totalPages={preloginGuide.length}
        currentPage={activeIndex}
        onChange={handleChange}
        styles={{
          active: styles.pagination_active,
          both: styles.pagination_both,
        }}
      ></Pagination>
      <AnimatedFade
        direction="vertical"
        distance={10}
        duration={450}
        trigger={reachedLastPage}
      >
        <Button
          type="primary"
          style={[styles.start_button, currentStyle?.button_style]}
          onPress={handleStart}
        >
          开始使用
        </Button>
      </AnimatedFade>
    </>
  );
};

export const styles = StyleSheet.create({
  guide_wrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: '240%',
    height: 6,
  },
  card_wrap: {
    width: '80%',
    height: '50%',
    backgroundColor: '#8F95F6',
    borderRadius: 12,
    borderColor: 'white',
    borderWidth: 6,
    marginVertical: 20,
  },
  start_button: {
    width: 200,
    borderRadius: 12,
    marginTop: 20,
  },
  pagination_active: {
    backgroundColor: '#7be9ee',
  },
  pagination_both: {
    marginHorizontal: 12,
  },
});
