// 根据开学时间计算学期和年份
export const getSemesterAndYear = (startTimestamp: number) => {
  const startDate = new Date(startTimestamp * 1000);
  const month = startDate.getMonth() + 1; // 获取开学时间的月份
  let semester = '1'; // 默认学期为 '1'
  let year = startDate.getFullYear().toString(); // 默认年份为当前年

  // 根据开学时间计算学期和年份
  if (month >= 1 && month <= 5) {
    // 1月到5月 => 第二学期
    semester = '2';
    year = (new Date().getFullYear() - 1).toString(); // 前一年
  } else if (month >= 6 && month <= 7) {
    // 6月到7月 => 第三学期
    semester = '3';
    year = (new Date().getFullYear() - 1).toString(); // 前一年
  } else if (month >= 8 && month <= 12) {
    // 8月到12月 => 第一学期
    semester = '1';
    year = new Date().getFullYear().toString(); // 当前年
  }
  return { semester, year };
};
