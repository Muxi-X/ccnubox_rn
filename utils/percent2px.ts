import { Dimensions } from 'react-native';

/**
 * 百分比 -> 实际数字，用于某些不能使用百分比的变量
 * @param {number} percent 百分比
 * @param {('width' | 'height')} direction 方向
 */
export const percent2px = (percent: number, direction?: 'width' | 'height') => {
  const windowRange = Dimensions.get('window')[direction ?? 'width'];
  return Number(((windowRange * percent) / 100).toFixed(1));
};
