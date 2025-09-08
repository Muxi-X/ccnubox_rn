import React from 'react';
import { StyleSheet, TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

import ThemeBasedText from '@/components/text';

import { ConfigurableThemeNames } from '@/styles/types';

export interface TypoTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  level?: 1 | 2 | 3 | 4 | 'body';
  configurableThemeName?: ConfigurableThemeNames;
  bold?: boolean;
}

/**
 * 通用排版文本组件
 * 支持一级到四级标题以及正文，默认支持主题切换
 * 支持加粗选项
 */
export function TypoText({
  style,
  lightColor,
  darkColor,
  level = 'body',
  configurableThemeName = 'text_style',
  bold = false,
  ...rest
}: TypoTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const getTextStyle = () => {
    switch (level) {
      case 1:
        return styles.h1;
      case 2:
        return styles.h2;
      case 3:
        return styles.h3;
      case 4:
        return styles.h4;
      case 'body':
      default:
        return styles.body;
    }
  };

  const getBoldStyle = () => {
    if (bold) {
      return styles.bold;
    }
    return {};
  };

  return (
    <ThemeBasedText
      style={[{ color }, getTextStyle(), getBoldStyle(), style]}
      configurableThemeName={configurableThemeName}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    marginTop: 24,
    marginBottom: 16,
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
    marginTop: 20,
    marginBottom: 12,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    marginTop: 16,
    marginBottom: 10,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginTop: 12,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
});
