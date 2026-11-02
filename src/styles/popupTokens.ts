import useVisualScheme from '@/store/visualScheme';

export const popupTokens = {
  // 圆角规范
  radius: {
    dialog: 25,
    modal: 25,
    toast: 20,
  },

  // 尺寸预设规范 (宽 × 高)
  dimensions: {
    dialog: {
      defaultWidth: 343,
      feedback: 262, // 默认：成功/已保存、退出登录、删除、清空等标准提示
      term: 313, // 切换学期
      calculate: 339, // 计算结果（平时学分绩）
      picker: 389, // 自习地点、时间段选择
      grade: 511, // 平时成绩明细
    },
    modal: {
      defaultWidth: 343,
      courseDetail: { width: 343, height: 313 }, // 课程卡片详情
      picker: { width: 343, height: 382 }, // 课程性质、学期底部选择
      pushSetting: { width: 429, height: 497 }, // 推送设置底部抽屉
    },
    toast: {
      mini: { width: 145, minHeight: 105 }, // 登录失败 (500)
      banner: { width: 267, minHeight: 134 }, // 复制成功、热更新检查
      square: { width: 259, minHeight: 264 }, // 已是最新版、修改成功
      largeSquare: { width: 337, minHeight: 338 }, // 备注已保存 (3D3D3D)
    },
  },

  // 字号规范 (根据设计稿：标题22/20、确认18、正文15、特大64)
  fontSize: {
    display: 64, // 平时成绩计算结果大数值
    dialogTitle: 22, // Dialog 标题
    modalTitle: 20, // Modal 标题、Toast大标题
    modalAction: 18, // Modal 确认按钮、Toast副标题
    body: 15, // Dialog正文/确认按钮、Modal正文、小Toast
  },

  // 颜色规范
  colors: {
    accent: '#867DF1',
    muted: '#8F8F8F',
    toastDarkBg: '#3D3D3D', // Toast特定深色底

    // 主题语义色
    dark: {
      surface: '#242424', // 弹窗底色
      primaryText: '#FFFFFF',
      secondaryText: '#8F8F8F',
      divider1: '#FFFFFF',
      divider2: '#8F8F8F',
      cancelButtonText: '#867DF1',
      cancelButtonBg: '#2A2A2E',
    },
    light: {
      surface: '#FFFFFF', // 弹窗底色
      primaryText: '#242424',
      secondaryText: '#8F8F8F',
      divider1: '#D8D8D8',
      divider2: '#D8D8D8',
      cancelButtonText: '#867DF1',
      cancelButtonBg: '#FFFFFF',
    },
  },
} as const;

export type DialogSize =
  | 'feedback'
  | 'term'
  | 'calculate'
  | 'picker'
  | 'grade'
  | number;

export const getDialogHeight = (size?: DialogSize): number => {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'term':
      return popupTokens.dimensions.dialog.term;
    case 'calculate':
      return popupTokens.dimensions.dialog.calculate;
    case 'picker':
      return popupTokens.dimensions.dialog.picker;
    case 'grade':
      return popupTokens.dimensions.dialog.grade;
    case 'feedback':
    default:
      return popupTokens.dimensions.dialog.feedback;
  }
};

export const usePopupColors = () => {
  const themeName = useVisualScheme(state => state.themeName);
  const isDark = themeName === 'dark';
  const themeColors = isDark
    ? popupTokens.colors.dark
    : popupTokens.colors.light;

  return {
    isDark,
    themeName,
    ...themeColors,
    accent: popupTokens.colors.accent,
    muted: popupTokens.colors.muted,
    toastDarkBg: popupTokens.colors.toastDarkBg,
  };
};

export default popupTokens;
