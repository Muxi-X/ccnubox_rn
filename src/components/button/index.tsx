import React, { FC } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

import { ButtonProps } from '@/components/button/type';

import useVisualScheme from '@/store/visualScheme';

import { commonColors } from '@/styles/common';

const Button: FC<ButtonProps> = ({
  isLoading = false,
  onPress,
  text_style,
  style,
  children,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <RectButton
      rippleColor={commonColors.lightPurple}
      activeOpacity={0.6}
      style={[
        styles.rect_button,
        currentStyle?.button_style,
        { opacity: isLoading ? 0.4 : 1 },
        style,
      ]}
      onPress={(...props) => {
        if (!isLoading) onPress?.(...props);
      }}
    >
      <View accessible accessibilityRole="button" style={[styles.button]}>
        {isLoading && (
          <ActivityIndicator color="#fff" style={{ marginRight: 5 }} /> // 加载指示器
        )}
        <Text style={[currentStyle?.button_text_style, text_style]}>
          {children}
        </Text>
      </View>
    </RectButton>
  );
};

const styles = StyleSheet.create({
  rect_button: {
    width: 200,
    height: 40,
    overflow: 'hidden',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 6,
  },
});

export default Button;
