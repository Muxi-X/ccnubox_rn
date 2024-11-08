import { commonColors } from '@/styles/common';
import { ThemeType } from '@/styles/types';

const { white, purple, black, lightGray, lightDark } = commonColors;
/** 基础样式 */
const baseStyle: ThemeType = {
  dark: {
    text_style: {
      color: lightGray,
    },
    navbar_background_style: {
      backgroundColor: lightDark,
    },
    header_background_style: {
      backgroundColor: lightDark,
    },
    header_text_style: {
      color: lightGray,
    },
    navbar_icon_active_style: {
      color: purple,
    },
    skeleton_background_style: {
      backgroundColor: lightDark,
    },
    modal_background_style: {
      backgroundColor: black,
    },
    button_style: {
      backgroundColor: purple,
    },
    button_text_style: {
      color: lightGray,
    },
    background_style: {
      backgroundColor: black,
    },
  },
  light: {
    text_style: {
      color: black,
    },
    header_background_style: {
      backgroundColor: white,
    },
    header_text_style: {
      color: black,
    },
    navbar_background_style: {
      backgroundColor: white,
    },
    navbar_icon_active_style: {
      color: purple,
    },
    modal_background_style: {
      backgroundColor: white,
    },
    button_style: {
      backgroundColor: purple,
      color: white,
    },
    button_text_style: {
      color: white,
    },
    skeleton_background_style: {
      backgroundColor: lightGray,
    },
    background_style: {
      backgroundColor: white,
    },
  },
};

export default baseStyle;
