import { MaterialIcons } from '@expo/vector-icons';
import { FC, memo, useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Modal from '@/components/modal';

import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import { commonStyles } from '@/styles/common';
import { log } from '@/utils/logger';

import { WeekSelectorProps } from './courseTable/type';

/** 学期显示文本映射 */
const SEMESTER_LABELS: Record<string, string> = {
  '1': '第一学期',
  '2': '第二学期',
  '3': '第三学期',
};

const WeekSelector: FC<WeekSelectorProps> = ({
  currentWeek,
  showWeekPicker,
  onWeekSelect,
  year,
  semester,
  semesterOptions,
  onClose,
  onSemesterChange,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const getCurrentWeek = useTimeStore(state => state.getCurrentWeek);

  // 本地预选学期状态（箭头切换只改这里，不立即请求）
  const [pendingYear, setPendingYear] = useState(year);
  const [pendingSemester, setPendingSemester] = useState(semester);

  // 预选学期在列表中的索引
  const pendingIndex = useMemo(() => {
    return semesterOptions.findIndex(
      opt => opt.year === pendingYear && opt.semester === pendingSemester
    );
  }, [semesterOptions, pendingYear, pendingSemester]);

  // 预选学期的显示文本
  const pendingLabel = useMemo(() => {
    if (pendingIndex >= 0) {
      return semesterOptions[pendingIndex].label;
    }
    return `${pendingYear}-${Number(pendingYear) + 1} ${SEMESTER_LABELS[pendingSemester] || ''}`;
  }, [pendingIndex, semesterOptions, pendingYear, pendingSemester]);

  // 是否可以向前/向后切换
  const canGoPrev = pendingIndex < semesterOptions.length - 1;
  const canGoNext = pendingIndex > 0;

  // 预选学期是否与当前学期不同
  const hasSemesterChanged =
    pendingYear !== year || pendingSemester !== semester;

  // 向前切换（更早的学期）—— 只改本地状态
  const handlePrev = useCallback(() => {
    if (!canGoPrev) return;
    const prevOpt = semesterOptions[pendingIndex + 1];
    setPendingYear(prevOpt.year);
    setPendingSemester(prevOpt.semester);
  }, [canGoPrev, semesterOptions, pendingIndex]);

  // 向后切换（更近的学期）—— 只改本地状态
  const handleNext = useCallback(() => {
    if (!canGoNext) return;
    const nextOpt = semesterOptions[pendingIndex - 1];
    setPendingYear(nextOpt.year);
    setPendingSemester(nextOpt.semester);
  }, [canGoNext, semesterOptions, pendingIndex]);

  // 关闭 WeekSelector 时，检测学期是否变化，变化则弹 Modal 确认
  const handleClose = useCallback(() => {
    if (hasSemesterChanged) {
      const targetLabel = pendingLabel;
      Modal.show({
        title: '切换学期',
        children: `确定要切换到「${targetLabel}」吗？切换后将重新加载课表数据。`,
        mode: 'middle',
        confirmText: '确定',
        cancelText: '取消',
        showCancel: true,
        onConfirm: () => {
          log.info('确认切换学期', `${pendingYear} 学期${pendingSemester}`);
          onSemesterChange(pendingYear, pendingSemester);
        },
        onCancel: () => {
          // 取消则恢复预选状态
          setPendingYear(year);
          setPendingSemester(semester);
        },
      });
    }
    onClose();
  }, [
    hasSemesterChanged,
    pendingLabel,
    pendingYear,
    pendingSemester,
    year,
    semester,
    onSemesterChange,
    onClose,
  ]);

  return (
    <>
      {showWeekPicker && (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            position: 'absolute',
          }}
        >
          {/* 点击遮罩区域关闭 */}
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor:
                  currentStyle?.schedule_background_style?.backgroundColor,
              },
            ]}
          >
            {/* 学期切换区域：左箭头 + 当前预选学期 + 右箭头 */}
            <View style={styles.semesterSwitcher}>
              <Pressable
                onPress={handlePrev}
                style={[
                  styles.arrowButton,
                  !canGoPrev && styles.arrowButtonDisabled,
                ]}
                disabled={!canGoPrev}
              >
                <MaterialIcons
                  name="chevron-left"
                  size={24}
                  color={
                    canGoPrev
                      ? currentStyle?.schedule_text_style?.color || '#000000'
                      : '#CCCCCC'
                  }
                />
              </Pressable>

              <View style={styles.semesterLabelContainer}>
                <Text
                  style={[
                    styles.semesterLabelText,
                    commonStyles.fontSemiBold,
                    {
                      color: hasSemesterChanged
                        ? '#7878F8'
                        : currentStyle?.schedule_text_style?.color || '#000000',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {pendingLabel}
                </Text>
              </View>

              <Pressable
                onPress={handleNext}
                style={[
                  styles.arrowButton,
                  !canGoNext && styles.arrowButtonDisabled,
                ]}
                disabled={!canGoNext}
              >
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={
                    canGoNext
                      ? currentStyle?.schedule_text_style?.color || '#000000'
                      : '#CCCCCC'
                  }
                />
              </Pressable>
            </View>
            {/* 周次选择区域 */}
            <View style={styles.weekGrid}>
              {[...Array(20)].map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    onWeekSelect(i + 1);
                    log.info('选择周次', i + 1);
                  }}
                  style={[
                    styles.weekButton,
                    {
                      backgroundColor:
                        currentWeek === i + 1
                          ? '#7878F8'
                          : currentStyle?.schedule_background_style
                              ?.backgroundColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.weekButtonText,
                      commonStyles.fontSemiBold,
                      {
                        color:
                          currentWeek === i + 1
                            ? '#FFFFFF'
                            : getCurrentWeek() === i + 1
                              ? '#7878F8'
                              : currentStyle?.schedule_text_style?.color ||
                                '#000000',
                      },
                    ]}
                  >
                    {i + 1}
                  </Text>
                  {getCurrentWeek() === i + 1 && (
                    <Text
                      style={[
                        commonStyles.fontSmall,
                        commonStyles.fontSemiBold,
                        {
                          position: 'absolute',
                          bottom: -12,
                          width: 31,
                          overflow: 'visible',
                          color: '#7878F8',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      当前周
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    position: 'absolute',
    width: '100%',
    borderEndStartRadius: 8,
    borderEndEndRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2000,
  },
  semesterSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  arrowButton: {
    padding: 4,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  semesterLabelContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  semesterLabelText: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  weekGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    left: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  weekButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  weekButtonText: {
    fontSize: 16,
  },
});

export default memo(WeekSelector);
