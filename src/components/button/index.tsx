import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

import { Button as RNEButton } from '@rneui/themed';

import { ButtonHierarchy, ButtonProps } from '@/components/button/type';

import useVisualScheme from '@/store/visualScheme';

// 分级默认圆角
const BORDER_RADIUS_MAP: Record<ButtonHierarchy, number> = {
  Primary: 20,
  Secondary: 15,
  Round: 30,
};

// 分级默认字体大小（1/2/3级默认均为20）
const FONT_SIZE_MAP: Record<ButtonHierarchy, number> = {
  Primary: 15,
  Secondary: 15,
  Round: 15,
};

// 分级默认最小高度与内边距
const PADDING_MAP: Record<
  ButtonHierarchy,
  { paddingVertical: number; paddingHorizontal: number; minHeight: number }
> = {
  Primary: { paddingVertical: 12, paddingHorizontal: 24, minHeight: 46 },
  Secondary: { paddingVertical: 10, paddingHorizontal: 18, minHeight: 40 },
  Round: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 34 },
};

function resolveLetterSpacing(
  letterSpacing: number | string | undefined,
  fontSize: number,
  type: ButtonHierarchy
): number | undefined {
  if (letterSpacing === undefined) {
    const defaultPercent =
      type === 'Secondary' ? 10 : type === 'Round' ? 5 : 15;
    return (fontSize * defaultPercent) / 100;
  }
  if (typeof letterSpacing === 'number') {
    return letterSpacing;
  }
  if (typeof letterSpacing === 'string') {
    if (letterSpacing.endsWith('%')) {
      const percent = parseFloat(letterSpacing);
      if (!isNaN(percent)) {
        return (fontSize * percent) / 100;
      }
    }
    const val = parseFloat(letterSpacing);
    return isNaN(val) ? undefined : val;
  }
  return undefined;
}

const Button: FC<ButtonProps> = ({
  type = 'Primary',
  isWhite,
  white,
  backgroundColor,
  textColor,
  fontSize,
  width,
  marginTop,
  letterSpacing,
  isLoading = false,
  onPress,
  text_style,
  style,
  buttonStyle,
  children,
  disabled,
  ...rest
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  const borderRadius = BORDER_RADIUS_MAP[type] ?? 20;
  const customBorderRadius =
    (StyleSheet.flatten(buttonStyle) as any)?.borderRadius ??
    (StyleSheet.flatten(style) as any)?.borderRadius;
  const finalBorderRadius = customBorderRadius ?? borderRadius;
  const defaultFontSize = FONT_SIZE_MAP[type] ?? 20;
  const paddingLayout = PADDING_MAP[type] ?? PADDING_MAP.Primary;

  const flattenedTextStyle = StyleSheet.flatten(text_style) || {};
  const resolvedFontSize =
    fontSize ?? flattenedTextStyle.fontSize ?? defaultFontSize;
  const calculatedLetterSpacing = resolveLetterSpacing(
    letterSpacing,
    resolvedFontSize,
    type
  );

  const isWhiteButton = Boolean(isWhite ?? white);

  // 默认背景色：白色按钮为 80% 不透明度白色底；普通按钮取主题或设计稿默认主色 #6A69E6
  const defaultBgColor = isWhiteButton
    ? 'rgba(255, 255, 255, 0.8)'
    : (currentStyle?.button_style?.backgroundColor ?? '#6A69E6');
  const finalBgColor = backgroundColor ?? defaultBgColor;

  // 默认文字颜色：白色按钮取主紫色 #6A69E6；普通按钮取主题或纯白
  const defaultTextColor = isWhiteButton
    ? '#6A69E6'
    : (currentStyle?.button_text_style?.color ?? '#FFFFFF');
  const finalTextColor = textColor ?? defaultTextColor;

  const loadingColor = isWhiteButton ? '#6A69E6' : '#FFFFFF';
  const isStringChild = typeof children === 'string';

  return (
    <RNEButton
      title={isStringChild ? children : undefined}
      onPress={onPress}
      disabled={disabled || isLoading}
      buttonStyle={[
        {
          backgroundColor: finalBgColor,
          borderRadius: finalBorderRadius,
          paddingVertical: paddingLayout.paddingVertical,
          paddingHorizontal: paddingLayout.paddingHorizontal,
          minHeight: paddingLayout.minHeight,
          alignItems: 'center',
          justifyContent: 'center',
        },
        currentStyle?.button_style,
        (backgroundColor || isWhiteButton) && { backgroundColor: finalBgColor },
        width !== undefined && { width },
        buttonStyle,
      ]}
      containerStyle={[
        {
          borderRadius: finalBorderRadius,
          overflow: 'hidden',
        },
        width !== undefined && { width },
        marginTop !== undefined && { marginTop },
        style,
      ]}
      loading={isLoading}
      loadingProps={{
        color: loadingColor,
        ...rest.loadingProps,
      }}
      titleStyle={[
        {
          color: finalTextColor,
          fontSize: resolvedFontSize,
          letterSpacing: calculatedLetterSpacing,
          fontWeight: '600',
        },
        currentStyle?.button_text_style,
        (textColor || isWhiteButton) && { color: finalTextColor },
        text_style,
      ]}
      disabledStyle={{
        backgroundColor: finalBgColor,
        opacity: 0.5,
      }}
      disabledTitleStyle={{
        color: finalTextColor,
      }}
      {...rest}
    >
      {!isStringChild ? children : undefined}
    </RNEButton>
  );
};

export { ButtonHierarchy, ButtonProps };
export default Button;
