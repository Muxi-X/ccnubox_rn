import { commonColors } from '@/styles/common';
import { SubThemeType } from '@/styles/types';

const { white, purple } = commonColors;
/** 基础样式 */
const baseStyle: SubThemeType = {
  border_style: {},
  text_style: {
    color: commonColors.black,
  },
  navbar_style: {
    backgroundColor: white,
  },
  navbar_icon_style: {
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
};

export default baseStyle;
