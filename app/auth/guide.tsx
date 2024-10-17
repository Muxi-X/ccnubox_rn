import { Button, Icon, Toast } from '@ant-design/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { FC, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import AnimatedFade from '@/components/animatedView/AnimatedFade';
import AnimatedOpacity from '@/components/animatedView/AnimatedOpacity';
import Pagination from '@/components/pagination';
import { preloginGuide } from '@/constants/prelogin';
import useVisualScheme from '@/store/visualScheme';
import { commonStyles } from '@/styles/common';
import { percent2px } from '@/utils/percent2px';

const PAGE_SWIPE_ANIMATION_DURATION = 450;
const { height: screenHeight } = Dimensions.get('window');
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
  // title和content的改变时机不一样，单独列一个state
  const [activeContentIndex, setActiveContentIndex] = useState<number>(0);
  const [toVisible, setToVisible] = useState<boolean>(true);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [reachedLastPage, setReachedLastPage] = useState<boolean>(false);
  const gradientValue = useSharedValue(0);
  const titleShift = useSharedValue(0);
  useEffect(() => {
    // 每次移动多少
    const percent = Math.floor(
      (percent2px(80) - 4 * commonStyles.fontExtraLarge.fontSize - 32) /
        (preloginGuide.length - 1)
    );
    titleShift.value = withTiming(Math.floor(percent * activeIndex), {
      easing: Easing.out(Easing.ease),
    });
    gradientValue.value = withTiming(
      percent * (activeIndex + 1) - percent2px(60 * 2),
      {
        easing: Easing.out(Easing.ease),
      }
    );
  }, [gradientValue, activeIndex, titleShift]);
  const gradientStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: gradientValue.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: titleShift.value }],
  }));
  const handleStart = () => {
    router.navigate('/auth/login');
  };
  useEffect(() => {
    runOnJS(() => setActiveContentIndex(activeIndex))();
  }, [titleShift.value]);
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
    setToVisible(false);
    setActiveIndex(pageNum);
    setTimeout(() => {
      setToVisible(true);
    }, PAGE_SWIPE_ANIMATION_DURATION + 200);
  };
  const onSwipe = Gesture.Pan()
    .minDistance(30)
    .onEnd(event => {
      // 渐入渐出动画
      if (event.translationX < -30) jump(activeIndex + 1);
      if (event.translationX > 30) jump(activeIndex - 1);
    })
    .runOnJS(true);
  const handleChange = (current: number) => {
    jump(current);
  };
  return (
    <>
      <GestureDetector gesture={onSwipe}>
        <View style={styles.card_wrap}>
          <Animated.Text
            style={[
              styles.title,
              commonStyles.fontExtraLarge,
              commonStyles.fontBold,
              titleStyle,
            ]}
          >
            {preloginGuide[activeIndex].title}
          </Animated.Text>
          <View style={styles.gradient_box}>
            <Animated.View style={gradientStyle}>
              <LinearGradient
                colors={['#94A6FF', '#94A6FF', '#70F5FF', '#94A6FF', '#94A6FF']}
                style={styles.gradient}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                collapsable
              ></LinearGradient>
            </Animated.View>
          </View>
          <AnimatedOpacity
            toVisible={toVisible}
            style={{ flex: 1 }}
            duration={PAGE_SWIPE_ANIMATION_DURATION}
          >
            {preloginGuide[activeContentIndex].content}
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
  gradient_box: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  gradient: {
    width: percent2px(60 * 4),
    height: 5,
  },
  card_wrap: {
    width: '80%',
    height: screenHeight < 700 ? '56%' : '61%',
    backgroundColor: '#8F95F6',
    borderRadius: 12,
    borderColor: 'white',
    borderWidth: 6,
    marginTop: 80,
    marginBottom: 20,
    padding: 12,
  },
  start_button: {
    width: 200,
    borderRadius: 12,
    marginTop: 20,
  },
  title: {
    color: '#46F2FF',
    marginBottom: 5,
    marginTop: 20,
  },
  pagination_active: {
    backgroundColor: '#46F2FF',
  },
  pagination_both: {
    marginHorizontal: 12,
  },
});
