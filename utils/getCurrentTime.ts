/**
 * 由于后端返回的是时间戳
 * 所以写一个转换函数 用于计算当前周
 * 后期维护时候注意一下捏
 * @param holidayTime 放假时间
 * @param schoolTime 开学时间
 * @returns currentWeek 当前周
 */
export function getCurrentTime(
  schoolTime: number,
  holidayTime: number
): number {
  const currentTime = Math.floor(Date.now() / 1000); // 获取当前时间戳（秒）

  // 计算当前时间与开学时间的时间差（秒）
  const elapsedTime = currentTime - schoolTime;

  if (elapsedTime < 0) {
    return 0; // 开学前，返回 0
  }

  // 计算周数（向上取整）
  const currentWeek = Math.floor(elapsedTime / (7 * 24 * 60 * 60)) + 1;

  // 如果超过假期时间，则返回假期前的最大周数
  if (currentTime >= holidayTime) {
    return Math.floor((holidayTime - schoolTime) / (7 * 24 * 60 * 60)) + 1;
  }

  return currentWeek;
}
