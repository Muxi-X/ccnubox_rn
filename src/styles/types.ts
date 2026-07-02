import { TextStyle, ViewStyle } from 'react-native';
/** 布局类型 */
export type LayoutName = 'android' | 'ios';
export type ThemeName = 'dark' | 'light';
/** 可配置style名 */
export type ConfigurableThemeNames =
  | 'text_style'
  | 'inverted_text_style'
  | 'placeholder_text_style'
  | 'button_style'
  | 'button_text_style'
  | 'navbar_background_style'
  | 'modal_background_style'
  | 'header_background_style'
  | 'header_text_style'
  | 'header_view_style'
  | 'schedule_background_style'
  | 'schedule_text_style'
  | 'schedule_week_text_style'
  | 'schedule_item_background_style'
  | 'schedule_border_style'
  | 'schedule_item_text_style'
  | 'notification_text_style'
  | 'background_style'
  | 'page_background_style'
  | 'picker_text_style'
  | 'picker_active_text_style'
  | 'secondary_background_style'
  | 'skeleton_background_style'
  | 'navbar_icon_active_text_style'
  | 'information_background_style'
  | 'information_title_text_style'
  | 'information_text_style'
  | 'elecprice_change_button_text_style'
  | 'elecprice_lighting_card_style'
  | 'elecprice_air_conditioner_card_style'
  | 'elecprice_standard_card_style'
  | 'FAQItem_background_style'
  | 'FAQItem_expandedBackground_style'
  | 'FAQItem_contentBackground_style'
  | 'FAQItem_icon_style'
  | 'feedback_defaultOption_style'
  | 'feedback_disabledSubmitButton_style'
  | 'feedback_card_style'
  | 'feedback_history_metaData_style'
  | 'feedback_history_metaData_text_style'
  | 'feedback_status_style'
  | 'feedback_statusText_style'
  | 'feedback_detail_statusCircle_style'
  | 'feedback_detail_text_style'
  | 'classroom_border_style'
  | 'classroom_accent_style'
  | 'classroom_accent_text_style'
  | 'classroom_status_style';

/** 状态-样式映射名（从 ConfigurableThemeNames 中按命名自动提取） */
type StatusStyleNames = Extract<
  ConfigurableThemeNames,
  `${string}status${string}`
>;

/** 按命名约定分类配置名 */
type TextStyleNames = Exclude<
  Extract<ConfigurableThemeNames, `${string}_text_style` | 'text_style'>,
  StatusStyleNames
>;
type ViewStyleNames = Exclude<
  Exclude<ConfigurableThemeNames, TextStyleNames>,
  StatusStyleNames
>;

/** 状态-样式映射表 */
type StatusStyleMap = Record<string, ViewStyle | TextStyle>;

/** 单个 Theme 配置类型 */
export type SingleThemeType = {
  [K in TextStyleNames]?: TextStyle;
} & {
  [K in ViewStyleNames]?: ViewStyle;
} & {
  [K in StatusStyleNames]?: StatusStyleMap;
};

/** 完整 layout 应有配置类型 */
export type LayoutType = {
  [_key in ThemeName]: Partial<ThemeType>;
};

/** 单个布局配置类型 */
export type ThemeType = Record<ThemeName, SingleThemeType>;

/** 颜色表 */
export type ColorType = Record<
  | 'red'
  | 'blue'
  | 'yellow'
  | 'purple'
  | 'lightPurple'
  | 'black'
  | 'green'
  | 'gray'
  | 'lightGray'
  | 'white'
  | 'lightDark'
  | 'darkGray'
  | 'textLight'
  | 'textDark'
  | 'tintColorLight'
  | 'iconLight'
  | 'iconDark'
  | 'backgroundDark',
  string
>;
