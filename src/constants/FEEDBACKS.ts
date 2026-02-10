export const STATUS_COLORS: Record<string, string> = {
  待处理: '#A8A8A8',
  处理中: '#FFD248',
  已完成: '#66D06A',
};

export const STATUS_BG_COLORS: Record<string, string> = {
  待处理: '#F3F4F6',
  处理中: '#FFF3CD',
  已完成: '#EEF7EE',
};

export const STATUS_LABELS = ['待处理', '处理中', '已完成'];

export const ISSUE_TYPE_MAP: Record<string, string> = {
  function: '功能异常',
  improvement: '产品改进',
};

export const MODULE_MAP: Record<string, string[]> = {
  function: [
    '首页板块',
    '课表板块',
    '其他板块',
    '登录相关',
    '加载/闪退',
    '其他问题',
  ],
  improvement: ['界面设计', '功能建议', '体验问题', '账号相关', '其他问题'],
};

export const FAQ_TABLE_IDENTIFY = 'ccnubox-faq';
export const FEEDBACK_TABLE_IDENTIFY = 'ccnubox';

export const FAQ_RECORD_NAMES = [
  '问题名称',
  '问题描述',
  '解决方案',
  '已解决',
  '未解决',
];

export const FEEDBACK_RECORD_NAMES = [
  '联系方式（QQ/邮箱）',
  '反馈内容',
  '截图',
  '问题类型',
  '问题来源',
  '进度',
  '回复内容',
  '提交时间',
];
