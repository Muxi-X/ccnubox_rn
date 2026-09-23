import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export default function LikeButton({ size = 21 }) {
  const [liked, setLiked] = useState(false); // ✅ React 状态
  const scale = useSharedValue(1); // ✅ 动画用

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPress = () => {
    setLiked(prev => !prev); // ✅ 触发重新 render

    scale.value = withSpring(1.4, {}, () => {
      scale.value = withSpring(1);
    });
  };

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={animatedStyle}>
        <AntDesign
          name={liked ? 'heart' : 'hearto'}
          size={size}
          color={liked ? '#FFD700' : '#737272'}
        />
      </Animated.View>
    </Pressable>
  );
}
