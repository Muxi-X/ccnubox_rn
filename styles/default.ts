import { geneStyleSheet } from '@/utils/geneStyleSheet';
/** 默认样式 */
export const defaultStyles = geneStyleSheet({
  dark: {
    schedule_background_style: {
      backgroundColor: '#242424',
    },
    schedule_text_style: {
      color: '#fff',
    },
    schedule_week_text_style: {
      color: '#fff',
    },
    header_view_style: {
      backgroundColor: '#fff',
    },
    schedule_border_style: {
      borderColor: '#242424',
    },
    schedule_item_background_style: {
      backgroundColor: '#242424',
    },
  },
  light: {
    schedule_background_style: {
      backgroundColor: '#fff',
    },
    schedule_text_style: {
      color: '#1D1D23',
    },
    schedule_week_text_style: {
      color: '#1D1D23',
    },
    header_view_style: {
      backgroundColor: '#fff',
    },
    schedule_border_style: {
      borderColor: '#E1E2F1',
    },
    schedule_item_background_style: {
      backgroundColor: '#F7F5FD',
    },
  },
});
