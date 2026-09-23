import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import useVisualScheme from '@/store/visualScheme';
import { commonColors } from '@/styles/common';
import { ProgressProps } from './types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Progress: React.FC<ProgressProps> = ({
  percent,
  type = 'circle',
  size = 80,
  strokeWidth = 13,
  strokeColor,
  trailColor,
  showText = true,
  format,
  textStyle,
  style,
  useTheme = false,
}) => {
  const { currentStyle, themeName } = useVisualScheme(
    ({ currentStyle, themeName }) => ({ currentStyle, themeName })
  );

  const actualStrokeColor = useMemo(
    () => strokeColor || commonColors.purple,
    [strokeColor]
  );
  const actualTrailColor = useMemo(() => {
    if (trailColor) return trailColor;
    if (useTheme) return themeName === 'dark' ? '#333' : commonColors.gray;
    return commonColors.gray;
  }, [trailColor, useTheme, themeName]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // --------- Reanimated 入场动画 ---------
  const animatedPercent = useSharedValue(0);

  useEffect(() => {
    animatedPercent.value = withTiming(percent, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent]);

  const animatedProps = useAnimatedProps(() => {
    const offset =
      circumference - (animatedPercent.value / 100) * circumference;
    return {
      strokeDashoffset: offset,
    };
  });

  const displayText = useMemo(() => {
    if (!showText) return null;
    return format ? format(percent) : `${percent}%`;
  }, [percent, showText, format]);

  const textColor = useMemo(() => {
    if (useTheme && currentStyle?.text_style?.color)
      return currentStyle.text_style.color;
    return themeName === 'dark' ? '#fff' : '#333';
  }, [useTheme, currentStyle, themeName]);

  if (type === 'circle') {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Svg width={size} height={size}>
          {/* 背景圆环 */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={actualTrailColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* 动画圆环 */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={actualStrokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {showText && (
          <View style={styles.textContainer}>
            {typeof displayText === 'string' ? (
              <Text
                style={[
                  styles.text,
                  { fontSize: size * 0.2, color: textColor },
                  textStyle,
                ]}
              >
                {displayText}
              </Text>
            ) : (
              displayText
            )}
          </View>
        )}
      </View>
    );
  }

  // --------- 线形进度条动画 ---------
  const animatedWidth = useSharedValue(0);
  useEffect(() => {
    animatedWidth.value = withTiming(Math.min(percent, 100), {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent]);

  return (
    <View style={[styles.lineContainer, style]}>
      <View style={[styles.lineTrail, { backgroundColor: actualTrailColor }]}>
        <Animated.View
          style={[
            styles.lineProgress,
            {
              backgroundColor: actualStrokeColor,

              height: strokeWidth,
            },
          ]}
        />
      </View>
      {showText && (
        <Text style={[styles.lineText, { color: textColor }, textStyle]}>
          {displayText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  lineTrail: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  lineProgress: {
    borderRadius: 3,
  },
  lineText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default Progress;
