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
    feedbackStatus_background_style: {
      待处理: 'rgba(156, 163, 175, 0.47)',
      处理中: 'rgba(255, 193, 7, 0.1)',
      已完成: 'rgba(76, 175, 80, 0.1)',
    },
    feedbackItem_background_style: {
      borderColor: '#3B3C3F',
      backgroundColor: '#303030',
    },
    FAQItem_background_style: {
      borderColor: '#3B3C3F',
      backgroundColor: '#303030',
    },
    expanded_FAQItem_background_style: {
      borderColor: '#857BF2',
      backgroundColor: '#303030',
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
    feedbackStatus_background_style: {
      待处理: '#F3F4F6',
      处理中: '#FFF3CD',
      已完成: '#EEF7EE',
    },
    feedbackItem_background_style: {
      borderColor: '#E5E7EB',
      backgroundColor: '#ffffff',
    },
    FAQItem_background_style: {
      borderColor: '#E5E7EB',
      backgroundColor: '#E5E7EB',
    },
    expanded_FAQItem_background_style: {
      borderColor: '#857BF2',
      backgroundColor: '#F6F5FF',
    },
  },
};

export default baseStyle;
