import * as React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { classroomIcons } from '@/assets/icons';
import Picker from '@/components/picker';
import Text from '@/components/text';
import useVisualScheme from '@/store/visualScheme';

import {
  ClassroomColumns,
  type ClassroomStatus,
  getClassPeriods,
  getCurrentDayOfWeek,
  getCurrentPeriod,
  getCurrentTimeSlot,
  getSelectedPeriods,
  type PickerColumnItem,
  type PickerColumns,
  prefix,
} from './model';

export {
  ClassroomColumns,
  getClassPeriods,
  getCurrentDayOfWeek,
  getCurrentPeriod,
  getCurrentTimeSlot,
  getSelectedPeriods,
  prefix,
};
export type { PickerColumnItem, PickerColumns };

const {
  choose: ChooseIcon,
  star: StarIcon,
  starGray: StarGrayIcon,
} = classroomIcons;

// 共享组件Props类型
export interface ClassroomContentProps {
  selectedValues: string[];
  selectedLabels: string[];
  inPickerValues: string[];
  pickerColumns: PickerColumns;
  pickerLoading: boolean;
  pickerError: string;
  classroomData: ClassroomStatus[];
  loading: boolean;
  error: string;
  starredClassrooms: string[];
  isClassroomStarred: (_roomNumber: string) => boolean;
  toggleStarredClassroom: (_roomNumber: string) => void;
  handleColumnChange: (
    _values: (string | number)[],
    _changedIndex: number
  ) => void;
  handlePickerConfirm: (_result: string[]) => void;
  handlePickerCancel: () => void;
  filterMode?: 'full' | 'time';
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
  pickerColumns,
  pickerLoading,
  pickerError,
  classroomData,
  loading,
  error,
  starredClassrooms,
  isClassroomStarred,
  toggleStarredClassroom,
  handleColumnChange,
  handlePickerConfirm,
  handlePickerCancel,
  filterMode = 'full',
  showStatusText = true,
  emptyStateConfig,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const currentPeriod = getCurrentPeriod();
  const pickerReady =
    pickerColumns[0].length > 0 && pickerColumns[1].length > 0;
  const contentReady = filterMode === 'full' ? pickerReady : true;

  const selector = (
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
      {pickerReady ? (
        <>
          <Text style={[styles.textItem, currentStyle?.text_style]}>
            {selectedLabels[0]}
          </Text>
          <Text style={[styles.textItem, currentStyle?.text_style]}>
            {selectedLabels[1]}
          </Text>
          <Text style={[styles.textItem, currentStyle?.text_style]}>
            {selectedLabels[2]}
          </Text>
        </>
      ) : (
        <Text style={[styles.selectorMessage, currentStyle?.text_style]}>
          {pickerLoading ? '教室列表加载中...' : pickerError}
        </Text>
      )}
    </View>
  );

  const timeSelector = (
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
      <Text style={[styles.timeText, currentStyle?.text_style]}>
        {selectedLabels[2]}
      </Text>
    </View>
  );

  return (
    <View style={[styles.content, currentStyle?.background_style]}>
      {filterMode === 'full' &&
        (pickerReady ? (
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
            {selector}
          </Picker>
        ) : (
          selector
        ))}
      {filterMode === 'time' && (
        <Picker
          onConfirm={result =>
            handlePickerConfirm([
              selectedValues[0],
              selectedValues[1],
              result[0],
            ])
          }
          onCancel={handlePickerCancel}
          mode="middle"
          prefixes={['时间']}
          titleDisplayLogic={() => '请选择时间段'}
          data={[pickerColumns[2]]}
          defaultValue={[selectedValues[2]]}
          controlledValue={[inPickerValues[2]]}
          onColumnChange={values =>
            handleColumnChange(
              [inPickerValues[0], inPickerValues[1], values[0]],
              2
            )
          }
        >
          {timeSelector}
        </Picker>
      )}

      {/* 显示课程节数表头 */}
      {contentReady && selectedLabels[2] && (
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
      {contentReady && selectedLabels[2] && (
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
  selectorMessage: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
  },
  timeText: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 39,
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
