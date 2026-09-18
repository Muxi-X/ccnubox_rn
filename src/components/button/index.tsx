import { Button as RNEButton } from '@rneui/themed';
import React, { FC } from 'react';

import { ButtonHierarchy, ButtonProps } from '@/components/button/type';
import useVisualScheme from '@/store/visualScheme';

// 默认字体大小
const DEFAULT_FONT_SIZE = 15;

interface ButtonVariant {
  borderRadius: number;
  letterSpacingPercent: number;
  paddingVertical: number;
  paddingHorizontal: number;
  minHeight: number;
}

// 分级规范映射表
const BUTTON_VARIANTS: Record<ButtonHierarchy, ButtonVariant> = {
  Primary: {
    borderRadius: 20,
    letterSpacingPercent: 15,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 46,
  },
  Secondary: {
    borderRadius: 15,
    letterSpacingPercent: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    minHeight: 40,
  },
  Round: {
    borderRadius: 30,
    letterSpacingPercent: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 38,
  },
  ghost: {
    borderRadius: 0,
    letterSpacingPercent: 0,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 0,
  },
};

function resolveLetterSpacing(
  letterSpacing: number | string | undefined,
  fontSize: number,
  type: ButtonHierarchy
): number | undefined {
  if (letterSpacing === undefined) {
    const percent = BUTTON_VARIANTS[type]?.letterSpacingPercent ?? 15;
    return (fontSize * percent) / 100;
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
  containerStyle,
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
  const variant = BUTTON_VARIANTS[type] ?? BUTTON_VARIANTS.Primary;

  const calculatedLetterSpacing = resolveLetterSpacing(
    letterSpacing,
    DEFAULT_FONT_SIZE,
    type
  );

  const themeTextStyle = isGhost
    ? (currentStyle?.text_style ?? { color: '#6A69E6' })
    : (currentStyle?.button_text_style ?? { color: '#FFFFFF' });

  const resolvedAndroidRipple = isGhost
    ? (android_ripple ?? null)
    : android_ripple;

  return (
    <RNEButton
      {...rest}
      type={isGhost ? 'clear' : 'solid'}
      onPress={onPress}
      disabled={disabled || isLoading}
      {...(resolvedAndroidRipple !== undefined && {
        android_ripple: resolvedAndroidRipple,
      })}
      buttonStyle={[
        {
          borderRadius: variant.borderRadius,
          paddingVertical: variant.paddingVertical,
          paddingHorizontal: variant.paddingHorizontal,
          minHeight: variant.minHeight,
          alignItems: 'center',
          justifyContent: 'center',
        },
        !isGhost &&
          (currentStyle?.button_style ?? { backgroundColor: '#6A69E6' }),
        buttonStyle,
      ]}
      containerStyle={[
        {
          borderRadius: variant.borderRadius,
          overflow: 'hidden',
        },
        containerStyle,
      ]}
      loading={isLoading}
      loadingProps={{
        color: (themeTextStyle?.color as string) ?? '#FFFFFF',
        ...rest.loadingProps,
      }}
      titleStyle={[
        {
          fontSize: DEFAULT_FONT_SIZE,
          letterSpacing: calculatedLetterSpacing,
          fontWeight: '600',
        },
        themeTextStyle,
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
