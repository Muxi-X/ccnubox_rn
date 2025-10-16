import { Icon, Toast } from '@ant-design/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import * as React from 'react';
import { FC, useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import AnimatedFade from '@/components/animatedView/AnimatedFade';
import AnimatedOpacity from '@/components/animatedView/AnimatedOpacity';
import Button from '@/components/button';
import Modal from '@/components/modal';
import Pagination from '@/components/pagination';

import usePrivacy from '@/store/privacy';
import useVisualScheme from '@/store/visualScheme';

import { preloginGuide } from '@/constants/prelogin';
import { commonColors, commonStyles } from '@/styles/common';
import { percent2px } from '@/utils';

const PAGE_SWIPE_ANIMATION_DURATION = 450;
const { height: screenHeight } = Dimensions.get('window');

const GuidePage: FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  // title和content的改变时机不一样，单独列一个state
  const [activeContentIndex, setActiveContentIndex] = useState<number>(0);
  const [toVisible, setToVisible] = useState<boolean>(true);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [reachedLastPage, setReachedLastPage] = useState<boolean>(false);
  const { agreement, setAgreement } = usePrivacy();
  const gradientValue = useSharedValue(0);
  const timeoutFn = (activeIndex: number, timeout: number) => {
    setTimeout(() => {
      setActiveContentIndex(activeIndex);
    }, timeout);
  };
  // 标题移动距离
  const titleShift = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      if (!agreement) {
        Modal.show({
          children: <AgreementModal />,
          mode: 'middle',
          cancelText: '不同意',
          confirmText: '同意并接受',
          onConfirm: () => {
            setAgreement(true);
          },
          onCancel() {
            if (Platform.OS === 'android') {
              router.replace('/auth/guide');
              BackHandler.exitApp();
            } else if (Platform.OS === 'ios') {
              router.replace('/auth/guide');
            }
          },
          onClose() {
            if (Platform.OS === 'android') {
              router.replace('/auth/guide');
            } else if (Platform.OS === 'ios') {
              router.replace('/auth/guide');
            }
          },
        });
      }
      return () => {};
    }, [])
  );

  useEffect(() => {
    'worklet';
    // 渐变条每次移动多少
    const percent = Math.floor(
      (percent2px(80) - 4 * commonStyles.fontExtraLarge.fontSize - 48) /
        (preloginGuide.length - 1)
    );
    titleShift.value = withTiming(Math.floor(percent * activeIndex), {
      easing: Easing.out(Easing.ease),
    });
    // runOnJS(setActiveContentIndex)(activeIndex)
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
    AsyncStorage.setItem('firstLaunch', 'true');
  };

  // 跳转第几条内容
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
      setActiveContentIndex(pageNum);
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
    <View style={styles.guide_wrap}>
      <GestureDetector gesture={onSwipe}>
        <View style={styles.card_wrap}>
          <Animated.View>
            {activeIndex !== preloginGuide.length - 1 ? (
              <TouchableOpacity
                onPress={handleStart}
                style={styles.skip_container}
              >
                <Text style={styles.skip_text}>跳过</Text>
                <Image source={require('@/assets/images/next.png')} />
              </TouchableOpacity>
            ) : (
              <View>
                <Text style={styles.skip_text}></Text>
              </View>
            )}
          </Animated.View>
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
            {/* 渐变条 */}
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
          {/* 内容部分 */}
          <AnimatedOpacity
            toVisible={toVisible}
            style={{ flex: 1 }}
            duration={PAGE_SWIPE_ANIMATION_DURATION}
          >
            {preloginGuide[activeContentIndex]?.content}
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
          style={[styles.start_button, currentStyle?.button_style]}
          onPress={handleStart}
        >
          开始使用
        </Button>
      </AnimatedFade>
    </View>
  );
};

export default GuidePage;

export const AgreementModal: FC = () => {
  return (
    <Text
      style={[commonStyles.fontMedium, { textAlign: 'center', lineHeight: 22 }]}
    >
      请你务必审慎阅读、充分理解“用户协议”和“隐私政策”各条款，包括但不限于：为了更好的向你提供服务，我们需要收集你的设备标识、操作日志等信息用于分析、优化应用性能。你可阅读
      <Text
        style={{ color: commonColors.purple, textDecorationLine: 'underline' }}
        onPress={() => {
          router.push('/(setting)/agreement');
          Modal.clear();
        }}
      >
        《用户协议》
      </Text>
      和
      <Text
        style={{ color: commonColors.purple, textDecorationLine: 'underline' }}
        onPress={() => {
          router.push('/(setting)/privacy');
          Modal.clear();
        }}
      >
        《隐私政策》
      </Text>
      了解详细信息。如果你同意，请点击下面按钮开始接受我们的服务。
    </Text>
  );
};

const styles = StyleSheet.create({
  skip_container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  skip_text: { color: '#fff', paddingRight: 5, fontSize: 18 },
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
    marginVertical: 10,
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
    padding: 20,
  },
  start_button: {
    width: 200,
    borderRadius: 12,
    marginTop: 20,
  },
  title: {
    color: '#46F2FF',
    // marginBottom: 5,
    // marginTop: 20,
  },
  pagination_active: {
    backgroundColor: '#46F2FF',
  },
  pagination_both: {
    marginHorizontal: 12,
  },
});
