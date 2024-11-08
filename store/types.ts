import React, { MutableRefObject, ReactElement } from 'react';
import WebView from 'react-native-webview';

import {
  LayoutType,
  LayoutName,
  ThemeName,
  SingleThemeType,
} from '@/styles/types';

/** 配色、布局整体store类型 */
export type visualSchemeType = {
  /** 注册的样式名 */
  themeName: ThemeName;
  /** 布局类型 */
  layoutName: LayoutName;
  /** 所有的可替换组件 */
  themeBasedComponents: ThemeBasedComponentMap;
  /** 目前的可替换组件 */
  currentComponents: Record<string, React.FC<any>>;
  /** 所有注册的 layout */
  layouts: Map<LayoutName, LayoutType>;
  /** 当前样式表 */
  currentStyle: SingleThemeType | null;
  /** 更改主题 */
  changeTheme: (name: ThemeName) => void;
  /** 更改布局 ios | android */
  changeLayout: (type: LayoutName) => void;
  /** 注册style中样式 */
  init: () => void;
  removeLayouts: (name: LayoutName) => void;
};

export type scraperType = {
  /* webview 的 ref */
  ref: MutableRefObject<WebView<{}> | undefined> | null;
  /* 注入的 js */
  injectJavaScript: (injected: string) => void;
  /* 设置 ref */
  setRef: (newRef: MutableRefObject<WebView<{}> | undefined> | null) => void;
};

/** portal */
export interface PortalStore {
  /* 全局 portal 的引用 */
  portalRef: React.RefObject<any>;
  /* 当前 portal 下挂载的节点数 */
  elements: Record<number, ReactElement>;
  /* 设置 portal 的 ref */
  setPortalRef: (ref: React.RefObject<any>) => void;
  /* 更新 portal 组件的值 */
  updateChildren: (key: number, props: any) => void;
  /* 在 portal 下挂载节点，可选 portalType，用于辨识节点类型，暂时没有用到，返回对应 key 值 */
  appendChildren: (newChildren: ReactElement, portalType?: string) => number;
  /* 通过 key 删除节点，每个 portal 下的组件都会接收到一个 currentKey 参数，代表当前 key 值 */
  deleteChildren: (key: number) => void;
  /* 通过 elements 遍历得出 portal 下真正的节点结构 */
  updateFromElements: () => void;
}

/** 基于 theme 变化而变化的组件 */
export type ThemeBasedComponentMap = Record<
  LayoutName,
  Record<string, React.FC<any>>
>;
