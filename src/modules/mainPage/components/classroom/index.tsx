import * as React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import Picker from '@/components/picker';
import Text from '@/components/text';

import useClassroomStarStore from '@/store/classroomStar';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import ChooseIcon from '@/assets/icons/choose.svg';
import StarGrayIcon from '@/assets/icons/star-gray.svg';
import StarIcon from '@/assets/icons/star.svg';
import { ClassroomColumns, ClassroomPrefix } from '@/constants/Classroom';
import { queryFreeClassroom } from '@/request/api/queryClassroom';

// 共享常量

// TOFIX: 手动硬编码判断当前学年和学期，需添加自动获取逻辑
export const currentYear = '2024-2025';
export const currentSemester = 1;

// 共享接口类型
export interface ClassroomClassroomAvailableStat {
  availableStat?: boolean[];
  classroom?: string;
}

export interface ClassroomGetFreeClassRoomResp {
  stat?: ClassroomClassroomAvailableStat[];
}

export interface Response {
  code?: number;
  data?: ClassroomGetFreeClassRoomResp;
  msg?: string;
}

export interface ClassroomStatus {
  roomNumber: string;
  status: {
    period: number;
    status: 'outTime' | 'free' | 'occupied';
  }[];
}

// 共享工具函数
export const getCurrentTimeSlot = (): '上午' | '下午' | '晚上' => {
  const now = new Date();
  const currentHour = now.getHours();

  if (currentHour >= 0 && currentHour < 12) {
    return '上午';
  } else if (currentHour >= 12 && currentHour < 18) {
    return '下午';
  } else {
    return '晚上';
  }
};

export const getCurrentDayOfWeek = (): number => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return dayOfWeek === 0 ? 7 : dayOfWeek;
};

export const getLabelsFromValues = (values: string[]) => {
  return values.map((value, index) => {
    const column = ClassroomColumns[index];
    const item = column.find(item => item.value === value);
    return item?.label || '';
  });
};

export const getClassPeriods = (timeSlot: string) => {
  switch (timeSlot) {
    case '上午':
      return ['1节', '2节', '3节', '4节'];
    case '下午':
      return ['5节', '6节', '7节', '8节'];
    case '晚上':
      return ['9节', '10节', '11节', '12节'];
    default:
      return [];
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'outTime':
      return '#D6D6D6'; // 灰色 - 过时
    case 'free':
      return '#D4EFA6'; // 绿色 - 空闲
    case 'occupied':
      return '#FF9D9D'; // 红色 - 占用
    default:
      return '#D6D6D6';
  }
};

export const getSelectedPeriods = (timeSlot: string) => {
  switch (timeSlot) {
    case '上午':
      return [1, 2, 3, 4];
    case '下午':
      return [5, 6, 7, 8];
    case '晚上':
      return [9, 10, 11, 12];
    default:
      return [];
  }
};

export const getCurrentPeriod = (): number => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const periods = [
    { period: 1, start: 0, end: 8 * 60 + 45 },
    { period: 2, start: 8 * 60 + 45, end: 9 * 60 + 40 },
    { period: 3, start: 9 * 60 + 40, end: 10 * 60 + 55 },
    { period: 4, start: 10 * 60 + 55, end: 11 * 60 + 50 },
    { period: 5, start: 11 * 60 + 50, end: 14 * 60 + 45 },
    { period: 6, start: 14 * 60 + 45, end: 15 * 60 + 40 },
    { period: 7, start: 15 * 60 + 40, end: 16 * 60 + 55 },
    { period: 8, start: 16 * 60 + 55, end: 17 * 60 + 50 },
    { period: 9, start: 17 * 60 + 50, end: 19 * 60 + 15 },
    { period: 10, start: 19 * 60 + 15, end: 20 * 60 + 5 },
    { period: 11, start: 20 * 60 + 5, end: 21 * 60 },
    { period: 12, start: 21 * 60, end: 21 * 60 + 50 },
  ];

  for (const periodInfo of periods) {
    if (currentTime >= periodInfo.start && currentTime < periodInfo.end) {
      return periodInfo.period;
    }
  }

  return 13;
};

export const isCurrentOrUpcomingPeriod = (period: number): boolean => {
  const currentPeriod = getCurrentPeriod();
  return currentPeriod === period;
};

// 自定义Hook用于教室数据管理
export const useClassroomData = (filterStarred: boolean = false) => {
  const { starredClassrooms, isClassroomStarred, toggleStarredClassroom } =
    useClassroomStarStore();
  const getCurrentWeek = useTimeStore(state => state.getCurrentWeek);
  const currentWeek = getCurrentWeek();
  const currentDayOfWeek = getCurrentDayOfWeek();
  const currentTimeSlot = getCurrentTimeSlot();

  const [selectedValues, setSelectedValues] = React.useState<string[]>([
    'n',
    '1',
    currentTimeSlot,
  ]);
  const [selectedLabels, setSelectedLabels] = React.useState<string[]>([
    '南湖综合楼',
    '1层',
    currentTimeSlot,
  ]);
  const [classroomData, setClassroomData] = React.useState<ClassroomStatus[]>(
    []
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  const handlePickerConfirm = (result: string[]) => {
    if (result.length > 0) {
      const [locationValue, floorValue, timeValue] = result;
      const values = [
        locationValue || 'n',
        floorValue || '1',
        timeValue || currentTimeSlot,
      ];
      const labels = getLabelsFromValues(values);

      setSelectedValues(values);
      setSelectedLabels(labels);
    } else {
      const defaultValues = ['n', '1', currentTimeSlot];
      const defaultLabels = getLabelsFromValues(defaultValues);
      setSelectedValues(defaultValues);
      setSelectedLabels(defaultLabels);
    }
  };

  const handlePickerCancel = () => {
    // 保持当前状态不变
  };

  const fetchClassroomData = async () => {
    try {
      setLoading(true);
      setError('');

      const [locationValue, floorValue, timeSlot] = selectedValues;
      const wherePrefix = locationValue + floorValue;
      const sections = getSelectedPeriods(timeSlot);

      const queryParams = {
        year: currentYear.toString(),
        semester: currentSemester.toString(),
        week: currentWeek,
        day: currentDayOfWeek,
        sections: sections,
        wherePrefix: wherePrefix,
      };

      const response: Response = await queryFreeClassroom(queryParams);

      if (response && response.data && response.data.stat) {
        const convertedData: ClassroomStatus[] = response.data.stat.map(
          (item: ClassroomClassroomAvailableStat) => ({
            roomNumber: item.classroom || '',
            status: item.availableStat
              ? item.availableStat.map(
                  (isAvailable: boolean, index: number) => ({
                    period: sections[index] || index + 1,
                    status: isAvailable ? 'free' : 'occupied',
                  })
                )
              : [],
          })
        );

        // 如果需要过滤收藏的教室
        const finalData = filterStarred
          ? convertedData.filter(classroom =>
              starredClassrooms.includes(classroom.roomNumber)
            )
          : convertedData;

        setClassroomData(finalData);
        setError('');
      } else {
        setClassroomData([]);
        setError(
          '由于假期等原因，空闲教室不可查询，具体信息请查询学校通知，敬请见谅~'
        );
      }
    } catch (error) {
      console.error('查询教室数据失败:', error);
      setClassroomData([]);
      setError(
        '由于假期等原因，空闲教室不可查询，具体信息请查询学校通知，敬请见谅~'
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchClassroomData();
  }, [
    selectedValues,
    currentWeek,
    currentDayOfWeek,
    ...(filterStarred ? [starredClassrooms] : []),
  ]);

  return {
    selectedValues,
    selectedLabels,
    classroomData,
    loading,
    error,
    starredClassrooms,
    isClassroomStarred,
    toggleStarredClassroom,
    handlePickerConfirm,
    handlePickerCancel,
  };
};

// 共享组件Props类型
export interface ClassroomContentProps {
  selectedValues: string[];
  selectedLabels: string[];
  classroomData: ClassroomStatus[];
  loading: boolean;
  error: string;
  starredClassrooms: string[];
  isClassroomStarred: (roomNumber: string) => boolean;
  toggleStarredClassroom: (roomNumber: string) => void;
  handlePickerConfirm: (result: string[]) => void;
  handlePickerCancel: () => void;
  showStatusText?: boolean;
  emptyStateConfig?: {
    noStarredTitle: string;
    noStarredSubtitle: string;
    noDataTitle: string;
    noDataSubtitle: string;
  };
}

// 教室内容组件
export const ClassroomContent: React.FC<ClassroomContentProps> = ({
  selectedValues,
  selectedLabels,
  classroomData,
  loading,
  error,
  starredClassrooms,
  isClassroomStarred,
  toggleStarredClassroom,
  handlePickerConfirm,
  handlePickerCancel,
  showStatusText = true,
  emptyStateConfig,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  return (
    <View style={[styles.content, currentStyle?.background_style]}>
      <Picker
        onConfirm={handlePickerConfirm}
        onCancel={handlePickerCancel}
        mode="middle"
        prefixes={ClassroomPrefix}
        titleDisplayLogic={() => '请选择'}
        data={ClassroomColumns}
        defaultValue={selectedValues}
      >
        <View style={[styles.textContainer, styles.containerBorder]}>
          <Text style={styles.textItem}>{selectedLabels[0]}</Text>
          <Text style={styles.textItem}>{selectedLabels[1]}</Text>
          <Text style={styles.textItem}>{selectedLabels[2]}</Text>
          <ChooseIcon
            width={25}
            height={25}
            color={currentStyle?.text_style?.color}
            style={{ marginLeft: 6 }}
          />
        </View>
      </Picker>

      {/* 显示课程节数表头 */}
      {selectedLabels[2] && (
        <View style={[styles.periodsContainer, styles.containerBorder]}>
          <View style={styles.periodItem}>
            <Text style={styles.periodText}>教室</Text>
          </View>
          {getClassPeriods(selectedLabels[2]).map((period, index) => {
            const periodNumber = parseInt(period.replace('节', ''));
            const isCurrentPeriod = isCurrentOrUpcomingPeriod(periodNumber);
            return (
              <View
                key={index}
                style={[
                  styles.periodItem,
                  isCurrentPeriod && styles.currentPeriodItem,
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    isCurrentPeriod && styles.currentPeriodText,
                  ]}
                >
                  {period}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* 显示教室空闲情况 */}
      {selectedLabels[2] && (
        <ScrollView style={styles.classroomList}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : emptyStateConfig && starredClassrooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {emptyStateConfig.noStarredTitle}
              </Text>
              <Text style={styles.emptySubText}>
                {emptyStateConfig.noStarredSubtitle}
              </Text>
            </View>
          ) : emptyStateConfig && classroomData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {emptyStateConfig.noDataTitle}
              </Text>
              <Text style={styles.emptySubText}>
                {emptyStateConfig.noDataSubtitle}
              </Text>
            </View>
          ) : (
            classroomData.map((classroom, index) => {
              const selectedPeriods = getSelectedPeriods(selectedLabels[2]);
              return (
                <View
                  key={index}
                  style={(currentStyle?.background_style, styles.classroomItem)}
                >
                  {/* 教室号码和收藏按钮 */}
                  <View style={styles.roomNumberContainer}>
                    <Text style={styles.roomNumber}>
                      {classroom.roomNumber}
                    </Text>
                    <TouchableOpacity
                      style={styles.starButton}
                      onPress={() =>
                        toggleStarredClassroom(classroom.roomNumber)
                      }
                    >
                      {isClassroomStarred(classroom.roomNumber) ? (
                        <StarIcon width={16} height={16} />
                      ) : (
                        <StarGrayIcon width={16} height={16} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {/* 空闲情况状态栏 */}
                  <View style={styles.statusContainer}>
                    {selectedPeriods.map(period => {
                      const periodStatus = classroom.status.find(
                        s => s.period === period
                      );
                      // 判断是否已过时
                      const currentPeriod = getCurrentPeriod();
                      const isOutTime =
                        currentPeriod > 0 && period < currentPeriod;
                      const finalStatus = isOutTime
                        ? 'outTime'
                        : periodStatus?.status || 'free';
                      return (
                        <View
                          key={period}
                          style={[
                            styles.statusItem,
                            { backgroundColor: getStatusColor(finalStatus) },
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {showStatusText
                              ? finalStatus === 'outTime'
                                ? ''
                                : finalStatus === 'free'
                                  ? '空'
                                  : '占'
                              : ''}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

// 共享样式
export const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 25,
  },
  textItem: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  containerBorder: {
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#D8D8D880',
  },
  periodsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  periodItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginHorizontal: 12,
  },
  periodText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#666',
  },
  currentPeriodItem: {
    backgroundColor: '#7878F8',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 0,
    color: '#FFFFFF',
  },
  currentPeriodText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  classroomList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  classroomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  roomNumberContainer: {
    width: 80,
    alignItems: 'center',
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  starButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  statusContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '300',
    color: '#7878F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
