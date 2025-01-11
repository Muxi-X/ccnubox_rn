import { Dimensions } from 'react-native';

/**
 * 百分比 -> 实际数字，用于某些不能使用百分比的变量
 * @param {number} percent 百分比
 * @param {('width' | 'height')} direction 方向
 */
export const percent2px = (
  percent: number,
  direction: 'width' | 'height' = 'width'
) => {
  const { width, height } = Dimensions.get('window');
  const windowRange = direction === 'width' ? width : height;
  return Number(((windowRange * percent) / 100).toFixed(1));
};

export default percent2px;
