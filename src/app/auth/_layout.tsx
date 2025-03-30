import { LinearGradient } from 'expo-linear-gradient';
import { Slot } from 'expo-router';
import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useKeyboardShow } from '@/hooks';

import AnimatedFade from '@/components/animatedView/AnimatedFade';
import Divider from '@/components/divider';

import { commonStyles } from '@/styles/common';

const Login: React.FC = () => {
  // 监听键盘弹起，避免元素遮挡
  const isKeyboardShow = useKeyboardShow();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={['#7B6EF1', '#7FB4FB']} style={styles.bg}>
        <AnimatedFade
          direction="vertical"
          distance={20}
          toVisible={!isKeyboardShow}
        >
          <Text
            style={[
              styles.text1,
              commonStyles.fontExtraLarge,
              commonStyles.fontBold,
            ]}
          >
            “需求太多？
          </Text>
          <Text
            style={[
              styles.text2,
              commonStyles.fontExtraLarge,
              commonStyles.fontBold,
            ]}
          >
            用匣子试试！”
          </Text>
        </AnimatedFade>
        <Slot />
        {/* 脚注 */}
        <View
          style={[
            styles.divider,
            { display: isKeyboardShow ? 'none' : 'flex' },
          ]}
        >
          <Divider>木犀团队出品</Divider>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default Login;

export const styles = StyleSheet.create({
  bg: {
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  text1: {
    position: 'absolute',
    color: 'white',
    top: 60,
    left: 30,
  },
  text2: {
    position: 'absolute',
    color: 'white',
    top: 100,
    left: 60,
  },
  divider: {
    position: 'absolute',
    bottom: 10,
    color: 'white',
    fontSize: 20,
  },
});
