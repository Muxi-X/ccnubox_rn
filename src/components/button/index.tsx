import { Button as RNEButton } from '@rneui/themed';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

import { ButtonHierarchy, ButtonProps } from '@/components/button/type';

import useVisualScheme from '@/store/visualScheme';

// 分级默认圆角
const BORDER_RADIUS_MAP: Record<ButtonHierarchy, number> = {
  Primary: 20,
  Secondary: 15,
  Round: 30,
  ghost: 0,
};

// 默认字体大小
const DEFAULT_FONT_SIZE = 15;

// 分级默认最小高度与内边距
const PADDING_MAP: Record<
  ButtonHierarchy,
  { paddingVertical: number; paddingHorizontal: number; minHeight: number }
> = {
  Primary: { paddingVertical: 12, paddingHorizontal: 24, minHeight: 46 },
  Secondary: { paddingVertical: 10, paddingHorizontal: 18, minHeight: 40 },
  Round: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 38 },
  ghost: { paddingVertical: 6, paddingHorizontal: 8, minHeight: 0 },
};

function resolveLetterSpacing(
  letterSpacing: number | string | undefined,
  fontSize: number,
  type: ButtonHierarchy
): number | undefined {
  if (letterSpacing === undefined) {
    const defaultPercent =
      type === 'Secondary'
        ? 10
        : type === 'Round'
          ? 5
          : type === 'ghost'
            ? 0
            : 15;
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
  letterSpacing,
  isLoading = false,
  onPress,
  textStyle,
  style,
  buttonStyle,
  disabledStyle,
  disabledTitleStyle,
  children,
  disabled,
  android_ripple,
  ...rest
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const isGhost = type === 'ghost';
  const defaultBorderRadius = BORDER_RADIUS_MAP[type] ?? (isGhost ? 0 : 20);

  const paddingLayout =
    PADDING_MAP[type] ?? (isGhost ? PADDING_MAP.ghost : PADDING_MAP.Primary);

  const flattenedButtonStyle = StyleSheet.flatten(buttonStyle) || {};
  const flattenedTextStyle = StyleSheet.flatten(textStyle) || {};

  const resolvedFontSize = flattenedTextStyle.fontSize ?? DEFAULT_FONT_SIZE;
  const calculatedLetterSpacing = resolveLetterSpacing(
    letterSpacing ?? (flattenedTextStyle as any)?.letterSpacing,
    resolvedFontSize,
    type
  );

  // 默认背景色：优先从 buttonStyle 获取；若无则 ghost 为透明，普通按钮取主题或设计稿默认主色 #6A69E6
  const customBgColor = (flattenedButtonStyle as any)?.backgroundColor;
  const defaultBgColor = isGhost
    ? 'transparent'
    : (currentStyle?.button_style?.backgroundColor ?? '#6A69E6');
  const finalBgColor = customBgColor ?? defaultBgColor;

  // 默认文字颜色：优先从 textStyle 获取；若无则 ghost 为主题文本色或主紫色，普通按钮取主题或纯白
  const customTextColor = flattenedTextStyle.color;
  const defaultTextColor = isGhost
    ? (currentStyle?.text_style?.color ?? '#6A69E6')
    : (currentStyle?.button_text_style?.color ?? '#FFFFFF');
  const finalTextColor = customTextColor ?? defaultTextColor;

  const loadingColor = isGhost
    ? (customTextColor ?? currentStyle?.text_style?.color ?? '#6A69E6')
    : (customTextColor ?? '#FFFFFF');

  // 水波纹配置：ghost 按钮默认无水波纹（除非显式传入）；普通按钮默认前景水波纹
  const bg = String(finalBgColor).toLowerCase();
  const isLightBackground =
    bg === '#ffffff' ||
    bg === '#fff' ||
    bg === 'white' ||
    finalTextColor === '#6A69E6';

  const defaultRippleColor = isLightBackground
    ? 'rgba(106, 105, 230, 0.25)'
    : 'rgba(255, 255, 255, 0.32)';

  const resolvedAndroidRipple = isGhost
    ? (android_ripple ?? null)
    : android_ripple === null
      ? null
      : {
          color: defaultRippleColor,
          borderless: false,
          foreground: true,
          ...android_ripple,
        };

  return (
    <RNEButton
      {...rest}
      type={isGhost ? 'clear' : 'solid'}
      onPress={onPress}
      disabled={disabled || isLoading}
      android_ripple={resolvedAndroidRipple}
      buttonStyle={[
        {
          backgroundColor: finalBgColor,
          borderRadius: defaultBorderRadius,
          paddingVertical: paddingLayout.paddingVertical,
          paddingHorizontal: paddingLayout.paddingHorizontal,
          minHeight: paddingLayout.minHeight,
          alignItems: 'center',
          justifyContent: 'center',
        },
        buttonStyle,
      ]}
      containerStyle={[
        {
          borderRadius: defaultBorderRadius,
          overflow: 'hidden',
        },
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
        textStyle,
      ]}
      disabledStyle={[
        {
          opacity: 0.5,
        },
        disabledStyle,
      ]}
      disabledTitleStyle={disabledTitleStyle}
    >
      {children}
    </RNEButton>
  );
};

export { ButtonHierarchy, ButtonProps };
export default Button;
