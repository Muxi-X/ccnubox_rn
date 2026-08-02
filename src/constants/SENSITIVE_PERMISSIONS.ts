import { type SensitivePermissionPurpose } from '@/store/sensitivePermission';

export const SENSITIVE_PERMISSION_PURPOSES = {
  feedbackImage: {
    id: 'feedback-image-v1',
    title: '图片访问说明',
    description:
      '用于选择并上传您主动添加的反馈图片，帮助我们定位和解决问题。应用只能访问您在系统界面中选中的图片。',
  },
  courseTableBackground: {
    id: 'course-table-background-v1',
    title: '图片访问说明',
    description:
      '用于选择您主动添加的图片并设置为课表背景。应用只能访问您在系统界面中选中的图片，不会上传未选择的内容。',
  },
  saveCourseTable: {
    id: 'save-course-table-v1',
    title: '存储权限使用说明',
    description: '用于将您主动生成的课表截图保存到设备相册。',
  },
  pushNotification: {
    id: 'push-notification-v1',
    title: '通知权限使用说明',
    description:
      '用于向您发送已订阅的校园消息和功能提醒，您可以随时在系统设置中关闭。',
  },
} as const satisfies Record<string, SensitivePermissionPurpose>;
