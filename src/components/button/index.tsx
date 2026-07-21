import React, { FC } from 'react';

import { Button as RNEButton } from '@rneui/themed';

import { ButtonProps } from '@/components/button/type';

import useVisualScheme from '@/store/visualScheme';

const Button: FC<ButtonProps> = ({
  isLoading = false,
  onPress,
  text_style,
  style,
  children,
  disabled,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <RNEButton
      title={children}
      onPress={onPress}
      disabled={disabled || isLoading}
      buttonStyle={[currentStyle?.button_style, { borderRadius: 6 }]}
      containerStyle={[{ width: 200, height: 40 }, style]}
      loading={isLoading}
      loadingProps={{ color: '#fff' }} //指定加载指示器的样式
      titleStyle={[currentStyle?.button_text_style, text_style]}
    />
  );
};

export default Button;
