import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
/** 布局类型 */
export type LayoutName = 'android' | 'ios';
export type ThemeName = 'dark' | 'light';
/** 可配置style名 */
export type ConfigurableThemeNames =
  | 'text_style'
  | 'button_style'
  | 'button_text_style'
  | 'navbar_background_style'
  | 'modal_background_style'
  | 'header_background_style'
  | 'header_text_style'
  | 'background_style'
  | 'skeleton_background_style'
  | 'navbar_icon_active_style';
/** 完整 layout 应有配置类型 */
export type LayoutType = {
  [key in ThemeName]: Partial<ThemeType>;
};
/** 单个布局配置类型 */
export type ThemeType = Record<ThemeName, SingleThemeType>;

/** 单个 Theme 配置类型 */
export type SingleThemeType = Partial<
  Record<ConfigurableThemeNames, ViewStyle | TextStyle | ImageStyle>
>;

/** 颜色表 */
export type ColorType = Record<
  | 'red'
  | 'blue'
  | 'yellow'
  | 'purple'
  | 'black'
  | 'green'
  | 'gray'
  | 'lightGray'
  | 'white'
  | 'lightDark'
  | 'darkGray',
  string
>;
