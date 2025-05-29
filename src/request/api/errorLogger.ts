import { request } from '@/request';

/**
 * 日志上报
 * @param type 错误类型, 默认为 frontend, 可根据需求修改
 * @param name 具体错误类型
 * @param data 上报数据
 */
const errorLogger = async (type: string, name: string, data: any) => {
  return await request.post(`/metrics/${type}/${name}` as any, {
    content: JSON.stringify(data),
  });
};

export default errorLogger;
