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
    information_title_text_style: {
      color: '#D6D6D6',
    },
    information_text_style: {
      color: '#ABAAAA',
    },
    picker_text_style: {
      color: '#707070',
    },
    picker_active_text_style: {
      color: '#D6D6D6',
    },
    secondary_background_style: {
      backgroundColor: '#444444',
    },
    elecprice_change_button_text_style: {
      color: '#444444',
    },
    elecprice_lighting_card_style: {
      backgroundColor: '#444444',
    },
    elecprice_air_conditioner_card_style: {
      backgroundColor: '#444444',
    },
    elecprice_standard_card_style: {
      backgroundColor: '#444444',
    },
    FAQItem_background_style: {
      backgroundColor: '#303030',
      borderColor: '#3B3C3F',
    },
    FAQItem_expandedBackground_style: {
      backgroundColor: '#303030',
      borderColor: '#7164FF',
    },
    FAQItem_contentBackground_style: {
      backgroundColor: '#3d3d3d',
    },
    FAQItem_icon_style: {
      backgroundColor: '#FFFFFF',
    },
    feedback_defaultOption_style: {
      backgroundColor: '#303030',
      borderColor: '#343434',
    },
    feedback_disabledSubmitButton_style: {
      backgroundColor: '#3B3C3F',
    },
    feedback_card_style: {
      backgroundColor: '#303030',
    },
    feedback_history_metaData_style: {
      backgroundColor: '#958DF433',
    },
    feedback_history_metaData_text_style: {
      color: '#E8E6FF',
    },
    feedback_status_style: {
      getStyle: (status: '待处理' | '处理中' | '已完成' | string) => {
        const statusMap: Record<string, { backgroundColor: string }> = {
          待处理: {
            backgroundColor: '#9CA3AF78',
          },
          处理中: {
            backgroundColor: '#FFCC001A',
          },
          已完成: {
            backgroundColor: '#4CAF501A',
          },
        };
        return statusMap[status] || statusMap['待处理'];
      },
    },
    feedback_statusText_style: {
      getStyle: (status: '待处理' | '处理中' | '已完成' | string) => {
        const statusMap: Record<string, { color: string }> = {
          待处理: {
            color: '#E5E7EB',
          },
          处理中: {
            color: '#FFC107',
          },
          已完成: {
            color: '#4CAF50',
          },
        };
        return statusMap[status] || statusMap['待处理'];
      },
    },
    feedback_detail_statusCircle_style: {
      getStyle: (status: '待处理' | '处理中' | '已完成' | string) => {
        const statusMap: Record<string, { backgroundColor: string }> = {
          待处理: {
            backgroundColor: '#E5E7EB',
          },
          处理中: {
            backgroundColor: '#FFD248',
          },
          已完成: {
            backgroundColor: '#66D06A',
          },
          默认: {
            backgroundColor: '#9E9E9E',
          },
        };
        return statusMap[status] || statusMap['默认'];
      },
    },
    feedback_detail_text_style: {
      color: '#9E9E9E',
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
    information_title_text_style: {
      color: '#000000',
    },
    information_text_style: {
      color: '#3D3D3D',
    },
    picker_text_style: {
      color: '#ABAAAA',
    },
    picker_active_text_style: {
      color: '#000000',
    },
    secondary_background_style: {
      backgroundColor: '#F5F5F5',
    },
    elecprice_change_button_text_style: {
      color: '#FFFFFF',
    },
    elecprice_lighting_card_style: {
      backgroundColor: '#FFE39A',
    },
    elecprice_air_conditioner_card_style: {
      backgroundColor: '#BAB9FC',
    },
    elecprice_standard_card_style: {
      backgroundColor: '#CFEEFF',
    },
    FAQItem_background_style: {
      backgroundColor: '#f5f5f5',
      borderColor: '#F6F5FF',
    },
    FAQItem_expandedBackground_style: {
      borderColor: '#857BF2',
      backgroundColor: '#F6F5FF',
    },
    FAQItem_contentBackground_style: {
      backgroundColor: 'white',
    },
    FAQItem_icon_style: {
      backgroundColor: '#484848',
    },
    feedback_defaultOption_style: {
      backgroundColor: '#fff',
      borderColor: '#ddd',
    },
    feedback_disabledSubmitButton_style: {
      backgroundColor: '#E5E5E5',
    },
    feedback_card_style: {
      backgroundColor: '#fff',
    },
    feedback_history_metaData_style: {
      backgroundColor: '#F6F5FF',
    },
    feedback_history_metaData_text_style: {
      color: '#7B70F1',
    },
    feedback_status_style: {
      getStyle: (status: '待处理' | '处理中' | '已完成' | string) => {
        const statusMap: Record<string, { backgroundColor: string }> = {
          待处理: {
            backgroundColor: '#F3F4F6',
          },
          处理中: {
            backgroundColor: '#FFCC001A',
          },
          已完成: {
            backgroundColor: '#4CAF501A',
          },
        };
        return statusMap[status] || statusMap['待处理'];
      },
    },
    feedback_statusText_style: {
      getStyle: (status: '待处理' | '处理中' | '已完成' | string) => {
        const statusMap: Record<string, { color: string }> = {
          待处理: {
            color: '#4B5563',
          },
          处理中: {
            color: '#FFC107',
          },
          已完成: {
            color: '#4CAF50',
          },
        };
        return statusMap[status] || statusMap['待处理'];
      },
    },
    feedback_detail_statusCircle_style: {
      getStyle: (status: '待处理' | '处理中' | '已完成' | string) => {
        const statusMap: Record<string, { backgroundColor: string }> = {
          待处理: {
            backgroundColor: '#A8A8A8',
          },
          处理中: {
            backgroundColor: '#FFD248',
          },
          已完成: {
            backgroundColor: '#66D06A',
          },
          默认: {
            backgroundColor: '#E5E7EB',
          },
        };
        return statusMap[status] || statusMap['默认'];
      },
    },
    feedback_detail_text_style: {
      color: '#9CA3AF',
    },
  },
});
