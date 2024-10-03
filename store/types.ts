import React, { MutableRefObject } from 'react';
import WebView from 'react-native-webview';

import { SubThemeType, ThemeType, layoutStyleType } from '@/styles/types';

/** 配色、布局整体store类型 */
export type visualSchemeType = {
  /** 注册的样式名 */
  name: string;
  /** 布局类型 */
  type: layoutStyleType;
  /** 所有注册的样式表 */
  styles: Map<string, ThemeType>;
  /** 当前样式表 */
  currentStyle: SubThemeType | null;
  /** 更改颜色 */
  changeColorStyle: (name: keyof ThemeType) => void;
  /** 更改布局 ios | android */
  changeLayoutStyle: (type: layoutStyleType) => void;
  /** 注册style中样式 */
  initStyles: () => void;
  removeStyles: (name: string) => void;
};

export type scraperType = {
  /* webview 的 ref */
  ref: MutableRefObject<WebView<{}> | undefined>;
  /* 注入的 js */
  injectJavaScript: (injected: string) => void;
  /* 设置 ref */
  setRef: (newRef: React.RefObject<WebView<{}> | null>) => void;
};
