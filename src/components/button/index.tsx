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
  Round: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 38 },
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
  height,
  marginTop,
  letterSpacing,
  isLoading = false,
  onPress,
  text_style,
  style,
  buttonStyle,
  disabledStyle,
  disabledTitleStyle,
  children,
  disabled,
  ...rest
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  const borderRadius = BORDER_RADIUS_MAP[type] ?? 20;
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const flattenedButtonStyle = StyleSheet.flatten(buttonStyle) || {};

  const customBorderRadius =
    (flattenedButtonStyle as any)?.borderRadius ??
    (flattenedStyle as any)?.borderRadius;
  const finalBorderRadius = customBorderRadius ?? borderRadius;

  const resolvedWidth =
    width ??
    (flattenedButtonStyle as any)?.width ??
    (flattenedStyle as any)?.width;
  const resolvedHeight =
    height ??
    (flattenedButtonStyle as any)?.height ??
    (flattenedStyle as any)?.height;

  // 如果在 buttonStyle 中写了 margin，应同步提取到 containerStyle，避免内层 Touchable 撑大导致水波纹/按压高亮溢出
  const resolvedMargin =
    (flattenedButtonStyle as any)?.margin ?? (flattenedStyle as any)?.margin;
  const resolvedMarginTop =
    marginTop ??
    (flattenedButtonStyle as any)?.marginTop ??
    (flattenedStyle as any)?.marginTop;
  const resolvedMarginBottom =
    (flattenedButtonStyle as any)?.marginBottom ??
    (flattenedStyle as any)?.marginBottom;
  const resolvedMarginLeft =
    (flattenedButtonStyle as any)?.marginLeft ??
    (flattenedStyle as any)?.marginLeft;
  const resolvedMarginRight =
    (flattenedButtonStyle as any)?.marginRight ??
    (flattenedStyle as any)?.marginRight;
  const resolvedMarginHorizontal =
    (flattenedButtonStyle as any)?.marginHorizontal ??
    (flattenedStyle as any)?.marginHorizontal;
  const resolvedMarginVertical =
    (flattenedButtonStyle as any)?.marginVertical ??
    (flattenedStyle as any)?.marginVertical;

  const innerButtonWidth =
    resolvedWidth === undefined
      ? undefined
      : typeof resolvedWidth === 'number'
        ? resolvedWidth
        : '100%';

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
        innerButtonWidth !== undefined && { width: innerButtonWidth },
        resolvedHeight !== undefined && {
          height: resolvedHeight,
          minHeight: resolvedHeight,
        },
        buttonStyle,
        // 清除 buttonStyle 里的 margin，避免内部 View 产生位移导致与外层 Pressable/水波纹区域尺寸不一致
        resolvedMargin !== undefined && { margin: 0 },
        resolvedMarginTop !== undefined && { marginTop: 0 },
        resolvedMarginBottom !== undefined && { marginBottom: 0 },
        resolvedMarginLeft !== undefined && { marginLeft: 0 },
        resolvedMarginRight !== undefined && { marginRight: 0 },
        resolvedMarginHorizontal !== undefined && { marginHorizontal: 0 },
        resolvedMarginVertical !== undefined && { marginVertical: 0 },
      ]}
      containerStyle={[
        {
          borderRadius: finalBorderRadius,
          overflow: 'hidden',
        },
        resolvedWidth !== undefined && { width: resolvedWidth },
        resolvedHeight !== undefined && { height: resolvedHeight },
        resolvedMargin !== undefined && { margin: resolvedMargin },
        resolvedMarginTop !== undefined && { marginTop: resolvedMarginTop },
        resolvedMarginBottom !== undefined && {
          marginBottom: resolvedMarginBottom,
        },
        resolvedMarginLeft !== undefined && { marginLeft: resolvedMarginLeft },
        resolvedMarginRight !== undefined && {
          marginRight: resolvedMarginRight,
        },
        resolvedMarginHorizontal !== undefined && {
          marginHorizontal: resolvedMarginHorizontal,
        },
        resolvedMarginVertical !== undefined && {
          marginVertical: resolvedMarginVertical,
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
          lineHeight: Math.round(resolvedFontSize * 1.3),
          letterSpacing: calculatedLetterSpacing,
          fontWeight: '600',
          includeFontPadding: false,
          textAlignVertical: 'center',
        },
        currentStyle?.button_text_style,
        (textColor || isWhiteButton) && { color: finalTextColor },
        text_style,
      ]}
      disabledStyle={[
        {
          backgroundColor: finalBgColor,
          opacity: 0.5,
        },
        disabledStyle,
      ]}
      disabledTitleStyle={[
        {
          color: finalTextColor,
        },
        disabledTitleStyle,
      ]}
      {...rest}
    >
      {!isStringChild ? children : undefined}
    </RNEButton>
  );
};

export { ButtonHierarchy, ButtonProps };
export default Button;
