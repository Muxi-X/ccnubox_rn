import React, { FC } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

import { ButtonProps } from '@/components/button/type';

import useVisualScheme from '@/store/visualScheme';

import { commonColors } from '@/styles/common';

const Button: FC<ButtonProps> = ({
  isLoading = false,
  onPress,
  style,
  children,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <RectButton
      activeOpacity={0.7}
      underlayColor={commonColors.gray}
      style={[styles.rect_button, style]}
      onPress={onPress}
    >
      <View
        accessible={!isLoading}
        accessibilityRole="button"
        style={[styles.button, currentStyle?.button_style]}
      >
        {isLoading && (
          <ActivityIndicator color="#fff" style={{ marginRight: 5 }} /> // 加载指示器
        )}
        <Text style={currentStyle?.button_text_style}>{children}</Text>
      </View>
    </RectButton>
  );
};

const styles = StyleSheet.create({
  rect_button: {
    width: 200,
    height: 40,
    overflow: 'hidden',
    borderRadius: 5,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export default Button;
