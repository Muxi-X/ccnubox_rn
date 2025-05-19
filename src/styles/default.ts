import generateStyleSheet from '@/utils/generateStyleSheet';

/** 默认样式 */
export const defaultStyles = generateStyleSheet({
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
      borderColor: '#505050',
    },
    schedule_item_background_style: {
      backgroundColor: '#242424',
    },
    notification_text_style: {
      color: '#A8A8A8',
    },
    information_background_style: {
      backgroundColor: '#444444',
    },
    information_title_style: {
      color: '#D6D6D6',
    },
    information_text_style: {
      color: '#ABAAAA',
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
      borderColor: '#F7F7F7',
    },
    schedule_item_background_style: {
      backgroundColor: '#F7F5FD',
    },
    notification_text_style: {
      color: '#3D3D3D',
    },
    information_background_style: {
      backgroundColor: '#F7F7F7',
    },
    information_title_style: {
      color: '#000000',
    },
    information_text_style: {
      color: '#3D3D3D',
    },
  },
});
