import * as React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import type { ClassroomStatus } from '@/hooks/useClassroomData';

import Picker from '@/components/picker';
import Text from '@/components/text';

import useVisualScheme from '@/store/visualScheme';

import ChooseIcon from '@/assets/icons/choose.svg';
import StarIcon from '@/assets/icons/star.svg';
import StarGrayIcon from '@/assets/icons/star-gray.svg';

// 共享常量
export const prefix = ['自习地点', '楼层', '时间'];

export const ClassroomColumns = [
  [
    { label: '南湖综合楼', value: 'n' },
    { label: '3号楼', value: '3' },
    { label: '7号楼', value: '7' },
    { label: '8号楼', value: '8' },
    { label: '9号楼', value: '9' },
    { label: '10号楼', value: '10' },
  ],
  [
    { label: '1层', value: '1' },
    { label: '2层', value: '2' },
    { label: '3层', value: '3' },
    { label: '4层', value: '4' },
    { label: '5层', value: '5' },
    { label: '6层', value: '6' },
    { label: '7层', value: '7' },
    { label: '8层', value: '8' },
  ],
  [
    { label: '上午', value: '上午' },
    { label: '下午', value: '下午' },
    { label: '晚上', value: '晚上' },
  ],
];

export type PickerColumnItem = { label: string; value: string };
export type PickerColumns = PickerColumnItem[][];

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

// 共享组件Props类型
export interface ClassroomContentProps {
  selectedValues: string[];
  selectedLabels: string[];
  inPickerValues: string[];
  pickerColumns?: PickerColumns;
  classroomData: ClassroomStatus[];
  loading: boolean;
  error: string;
  starredClassrooms: string[];
  isClassroomStarred: (roomNumber: string) => boolean;
  toggleStarredClassroom: (roomNumber: string) => void;
  handleColumnChange: (
    values: (string | number)[],
    changedIndex: number
  ) => void;
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
  inPickerValues,
  pickerColumns = ClassroomColumns,
  classroomData,
  loading,
  error,
  starredClassrooms,
  isClassroomStarred,
  toggleStarredClassroom,
  handleColumnChange,
  handlePickerConfirm,
  handlePickerCancel,
  showStatusText = true,
  emptyStateConfig,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const currentPeriod = getCurrentPeriod();

  return (
    <View style={[styles.content, currentStyle?.background_style]}>
      <Picker
        onConfirm={handlePickerConfirm}
        onCancel={handlePickerCancel}
        mode="middle"
        prefixes={prefix}
        titleDisplayLogic={() => '请选择'}
        data={pickerColumns}
        defaultValue={selectedValues}
        controlledValue={inPickerValues}
        onColumnChange={handleColumnChange}
      >
        <View
          style={[
            styles.textContainer,
            styles.containerBorder,
            currentStyle?.classroom_border_style,
          ]}
        >
          <ChooseIcon
            width={25}
            height={25}
            color={currentStyle?.text_style?.color}
            style={{ marginRight: 14 }}
          />
          <Text style={[styles.textItem, currentStyle?.text_style]}>
            {selectedLabels[0]}
          </Text>
          <Text style={[styles.textItem, currentStyle?.text_style]}>
            {selectedLabels[1]}
          </Text>
          <Text style={[styles.textItem, currentStyle?.text_style]}>
            {selectedLabels[2]}
          </Text>
        </View>
      </Picker>

      {/* 显示课程节数表头 */}
      {selectedLabels[2] && (
        <View
          style={[
            styles.periodsContainer,
            styles.containerBorder,
            currentStyle?.classroom_border_style,
          ]}
        >
          <View style={styles.periodItem}>
            <Text
              style={[styles.periodText, currentStyle?.notification_text_style]}
            >
              教室
            </Text>
          </View>
          {getClassPeriods(selectedLabels[2]).map((period, index) => {
            const periodNumber = parseInt(period.replace('节', ''));
            const isCurrentPeriod = currentPeriod === periodNumber;
            return (
              <View
                key={index}
                style={[
                  styles.periodItem,
                  isCurrentPeriod && styles.currentPeriodItem,
                  isCurrentPeriod && currentStyle?.classroom_accent_style,
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    currentStyle?.notification_text_style,
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
              <Text
                style={[
                  styles.loadingText,
                  currentStyle?.notification_text_style,
                ]}
              >
                加载中...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text
                style={[
                  styles.errorText,
                  currentStyle?.notification_text_style,
                ]}
              >
                {error}
              </Text>
            </View>
          ) : emptyStateConfig && starredClassrooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, currentStyle?.text_style]}>
                {emptyStateConfig.noStarredTitle}
              </Text>
              <Text
                style={[
                  styles.emptySubText,
                  currentStyle?.notification_text_style,
                ]}
              >
                {emptyStateConfig.noStarredSubtitle}
              </Text>
            </View>
          ) : emptyStateConfig && classroomData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, currentStyle?.text_style]}>
                {emptyStateConfig.noDataTitle}
              </Text>
              <Text
                style={[
                  styles.emptySubText,
                  currentStyle?.notification_text_style,
                ]}
              >
                {emptyStateConfig.noDataSubtitle}
              </Text>
            </View>
          ) : (
            classroomData.map(classroom => {
              const selectedPeriods = getSelectedPeriods(selectedLabels[2]);
              return (
                <View
                  key={classroom.roomNumber}
                  style={[
                    styles.classroomItem,
                    currentStyle?.secondary_background_style,
                  ]}
                >
                  {/* 教室号码和收藏按钮 */}
                  <View style={styles.roomNumberContainer}>
                    <Text style={[styles.roomNumber, currentStyle?.text_style]}>
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
                            currentStyle?.classroom_status_style?.[finalStatus],
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              currentStyle?.classroom_accent_text_style,
                            ]}
                          >
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
    flex: 1,
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
    backgroundColor: '#F7F7F7',
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
