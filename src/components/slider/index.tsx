import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import { commonColors } from '@/styles/common';

import { SliderProps } from './types';

const THUMB_SIZE = 20;
const TRACK_HEIGHT = 4;
const CONTAINER_HEIGHT = THUMB_SIZE;
const TRACK_TOP = (CONTAINER_HEIGHT - TRACK_HEIGHT) / 2;

// ponytail: 使用 RNGH 原生手势替代 @rneui/themed Slider 的 JS PanResponder，
// 原生手势可在 native 线程抢占触摸，阻止 Tabs/Stack 手势冲突
const Slider = ({
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
  thumbStyle,
  style,
  minimumTrackTintColor,
}: SliderProps) => {
  const trackWidth = useSharedValue(1);
  const dragValue = useSharedValue(value);
  const lastSynced = useSharedValue(value);

  // ponytail: 同步外部 value 变化到 shared value
  useEffect(() => {
    dragValue.value = value;
    lastSynced.value = value;
  }, [value]);

  const computeValue = useCallback(
    (x: number) => {
      'worklet';
      const ratio = Math.max(0, Math.min(1, x / trackWidth.value));
      let v = ratio * (maximumValue - minimumValue) + minimumValue;
      if (step) v = Math.round(v / step) * step;
      return Math.max(minimumValue, Math.min(maximumValue, v));
    },
    [maximumValue, minimumValue, step, trackWidth]
  );

  const syncToJS = (v: number) => {
    'worklet';
    if (v !== lastSynced.value) {
      lastSynced.value = v;
      if (onValueChange) runOnJS(onValueChange)(v);
    }
  };

  const panGesture = Gesture.Pan()
    .onBegin(e => {
      if (onSlidingStart) runOnJS(onSlidingStart)();
      const v = computeValue(e.x);
      dragValue.value = v;
      syncToJS(v);
    })
    .onUpdate(e => {
      const v = computeValue(e.x);
      dragValue.value = v;
      syncToJS(v);
    })
    .onEnd(() => {
      if (onSlidingComplete) runOnJS(onSlidingComplete)();
    });

  // ponytail: thumb 水平偏移，clamp ratio 防止 NaN，guard trackWidth 防止初始帧负值
  const thumbLeft = useDerivedValue(() => {
    const range = maximumValue - minimumValue;
    if (range === 0) return 0;
    const ratio = (dragValue.value - minimumValue) / range;
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    return clampedRatio * Math.max(0, trackWidth.value - THUMB_SIZE);
  }, [minimumValue, maximumValue, trackWidth]);

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={[{ height: CONTAINER_HEIGHT, justifyContent: 'center' }, style]}
        onLayout={e => {
          trackWidth.value = e.nativeEvent.layout.width;
        }}
      >
        {/* 轨道 */}
        <View
          style={{
            position: 'absolute',
            top: TRACK_TOP,
            left: 0,
            right: 0,
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
            backgroundColor: '#b3b3b3',
            overflow: 'visible',
          }}
        />
        {/* 已填充轨道 */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: TRACK_TOP,
              height: TRACK_HEIGHT,
              borderRadius: TRACK_HEIGHT / 2,
              backgroundColor: minimumTrackTintColor,
            },
            { width: thumbLeft },
          ]}
        />
        {/* thumb */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: commonColors.purple,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
            },
            thumbStyle,
            { transform: [{ translateX: thumbLeft }] },
          ]}
        />
      </View>
    </GestureDetector>
  );
};

export default Slider;
