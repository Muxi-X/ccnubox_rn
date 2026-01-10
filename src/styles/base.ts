import { commonColors } from '@/styles/common';
import { ThemeType } from '@/styles/types';

const { white, purple, black, lightGray, lightDark } = commonColors;
/** 基础样式 */
const baseStyle: ThemeType = {
  dark: {
    text_style: {
      color: lightGray,
    },
    placeholder_text_style: {
      color: '#969696',
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
    navbar_icon_active_text_style: {
      color: purple,
    },
    skeleton_background_style: {
      backgroundColor: lightDark,
    },
    modal_background_style: {
      backgroundColor: black,
      zIndex: 1,
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
    page_background_style: {
      backgroundColor: black,
    },
  },
  light: {
    text_style: {
      color: black,
    },
    placeholder_text_style: {
      color: '#ABAAAA',
    },
    header_background_style: {
      backgroundColor: lightGray,
    },
    header_text_style: {
      color: black,
    },
    navbar_background_style: {
      backgroundColor: white,
    },
    navbar_icon_active_text_style: {
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
    page_background_style: {
      backgroundColor: 'rgba(250, 250, 250, 1)',
    },
  },
};

export default baseStyle;
