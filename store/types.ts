import { MutableRefObject } from 'react';
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
  /** 更改主题 */
  changeTheme: (name: keyof ThemeType) => void;
  /** 更改布局 ios | android */
  changeLayoutStyle: (type: layoutStyleType) => void;
  /** 注册style中样式 */
  initStyles: () => void;
  removeStyles: (name: string) => void;
};

export type scraperType = {
  /* webview 的 ref */
  ref: MutableRefObject<WebView<{}> | undefined> | null;
  /* 注入的 js */
  injectJavaScript: (injected: string) => void;
  /* 设置 ref */
  setRef: (newRef: MutableRefObject<WebView<{}> | undefined> | null) => void;
};
