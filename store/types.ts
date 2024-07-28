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
  changeColorStyle: (type: keyof ThemeType) => void;
  changeLayoutStyle: (type: layoutStyleType) => void;
  /** 注册style中样式 */
  initStyles: () => void;
  removeStyles: (name: string) => void;
};
