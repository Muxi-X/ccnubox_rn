import { Button } from '@ant-design/react-native';
import { router } from 'expo-router';
import React, { memo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AnimatedFade from '@/components/animatedView/AnimatedFade';
import Modal from '@/components/modal';
import ThemeChangeText from '@/components/text';

import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import DeleteIcon from '@/assets/icons/calendar/delete.svg';
import EditIcon from '@/assets/icons/calendar/edit.svg';
import FailIcon from '@/assets/icons/calendar/fail.svg';
import LocationIcon from '@/assets/icons/calendar/location.svg';
import NoteIcon from '@/assets/icons/calendar/note.svg';
import SuccessIcon from '@/assets/icons/calendar/success.svg';
import TeacherIcon from '@/assets/icons/calendar/teacher.svg';
import TimeIcon from '@/assets/icons/calendar/time.svg';
import WeekIcon from '@/assets/icons/calendar/week.svg';
import {
  addCourseNote,
  deleteCourse,
  deleteCourseNote,
} from '@/request/api/course';

interface ModalContentProps {
  id: string;
  courseName: string;
  teacher: string;
  classroom: string;
  isThisWeek: boolean;
  week_duration: string;
  credit: number;
  class_when: string;
  date: string;
  note?: string;
  is_official: boolean;
}

interface ModalContentFooterProps {
  is_official: boolean;
  courseId: string;
  currentStyle: any;
}

function handleDeleteCourseConfirm(id: string) {
  deleteCourse(
    id,
    useTimeStore.getState().semester,
    useTimeStore.getState().year
  )
    .then(res => {
      if (res.code === 0) {
        useCourse.getState().deleteCourse(id);
        showModal('删除成功', '课程已删除', true);
      }
    })
    .catch(err => {
      if (err.response.data.code === 50001) {
        showModal('删除失败', '从教务系统导入的课程不支持删除', false);
      }
    });
}

// 封装modal
function showModal(title: string, message: string, isSuccess: boolean = true) {
  const currentStyle = useVisualScheme.getState().currentStyle;

  const icon = isSuccess ? (
    <SuccessIcon height={150} width={150} />
  ) : (
    <FailIcon height={150} width={150} />
  );

  Modal.show({
    title,
    children: (
      <View
        style={{
          alignItems: 'center',
          gap: 10,
          paddingBottom: 20,
          width: 180,
        }}
      >
        {icon}
        <Text
          style={[
            currentStyle?.text_style,
            { fontSize: 20, textAlign: 'center' },
          ]}
        >
          {message}
        </Text>
      </View>
    ),
    mode: 'middle',
    showCancel: false,
  });
}

function handleSaveCourseNote(
  courseId: string,
  noteText: string,
  updateCourseNote: (id: string, note: string) => void,
  setIsNoted: (value: boolean) => void,
  setIsSaving: (value: boolean) => void
) {
  const { semester, year } = useTimeStore.getState();
  setIsSaving(true);

  // 根据note确定调用哪个API
  const handleCourseNote = !noteText
    ? deleteCourseNote({ classId: courseId, semester, year })
    : addCourseNote({ classId: courseId, note: noteText, semester, year });

  handleCourseNote
    .then(res => {
      if (res.code === 0) {
        updateCourseNote(courseId, noteText);
        showModal('保存成功', '备注已保存', true);
      }
    })
    .catch(_ => {
      showModal('保存失败', '请稍后再试', false);
    })
    .finally(() => {
      setIsNoted(false);
      setIsSaving(false);
    });
}

// 根据is_official来决定footer的功能
const ModalContentFooter: React.FC<ModalContentFooterProps> = memo(
  function ModalContentFooter({ is_official, courseId, currentStyle }) {
    const [isNoted, setIsNoted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { updateCourseNote } = useCourse();

    const currNote = useCourse(
      state => state.courses.find(c => c.id === courseId)?.note || ''
    );

    const [noteText, setNoteText] = useState(currNote);

    // note上限是100字，太多会把footer给撑开，这里先做了裁断，点开之后再查看详细note
    const truncateText = (text: string, maxLength: number = 10) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    // 根据课程性质渲染不同的footer
    if (!is_official) {
      return (
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            justifyContent: 'space-around',
            borderTopWidth: 0.5,
            borderTopColor: '#E1E2F1',
          }}
        >
          <Button
            styles={{
              wrapperStyle: { borderWidth: 0 },
              ghostRawText: { fontSize: 14 },
            }}
            type="ghost"
            onPress={() => {
              Modal.clear();
              Modal.show({
                title: '删除课程',
                children: '确定要删除该课程吗？',
                mode: 'middle',
                showCancel: true,
                confirmText: '删除',
                cancelText: '取消',
                onConfirm: () => handleDeleteCourseConfirm(courseId),
              });
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <DeleteIcon
                width={16}
                height={16}
                color={currentStyle?.text_style?.color}
              />
              <Text style={currentStyle?.text_style}>删除</Text>
            </View>
          </Button>
          <Button
            styles={{
              wrapperStyle: { borderWidth: 0 },
              ghostRawText: { fontSize: 14 },
            }}
            type="ghost"
            onPress={() => {
              Modal.clear();
              router.push({
                pathname: '/(courseTable)/editCourse',
                params: { id: courseId },
              });
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <EditIcon
                width={20}
                height={20}
                color={currentStyle?.text_style?.color}
              />
              <Text style={currentStyle?.text_style}>编辑</Text>
            </View>
          </Button>
        </View>
      );
    }

    return (
      <View
        style={{
          flexDirection: 'column',
          borderTopWidth: 0.5,
          borderTopColor: '#E1E2F1',
        }}
      >
        <AnimatedFade
          trigger={isNoted}
          direction="vertical"
          distance={isNoted ? 20 : 0}
          duration={200}
          toVisible={isNoted}
        >
          <View style={styles.noteDisplayArea}>
            <TouchableOpacity
              style={styles.touchableBtn}
              onPress={() => {
                setIsNoted(!isNoted);
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
              >
                <NoteIcon
                  width={20}
                  height={20}
                  color={currentStyle?.text_style?.color}
                  style={styles.icon}
                />
                <Text
                  style={[currentStyle?.text_style]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {isNoted
                    ? '备注'
                    : currNote
                      ? truncateText(currNote)
                      : '点击可添加备注'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {isNoted && (
            <>
              <View style={styles.noteInputArea}>
                <TextInput
                  style={[styles.noteInput, currentStyle.text_style]}
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                  maxLength={100}
                  textAlignVertical="top"
                />
                <View style={styles.charCount}>
                  <Text style={[currentStyle?.text_style, { fontSize: 12 }]}>
                    {noteText.length}/100
                  </Text>
                </View>
              </View>

              <View style={styles.noteActionsArea}>
                <TouchableOpacity
                  style={[styles.touchableBtn, isSaving && { opacity: 0.6 }]}
                  disabled={isSaving}
                  onPress={() => {
                    setNoteText('');
                  }}
                >
                  <Text style={currentStyle?.text_style}>清除</Text>
                </TouchableOpacity>

                <View style={styles.rightButtons}>
                  <TouchableOpacity
                    style={[styles.touchableBtn, isSaving && { opacity: 0.6 }]}
                    disabled={isSaving}
                    onPress={() => {
                      setIsNoted(false);
                      setNoteText(currNote);
                    }}
                  >
                    <Text style={currentStyle?.text_style}>取消</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.touchableBtn, isSaving && { opacity: 0.6 }]}
                    disabled={isSaving}
                    onPress={() => {
                      handleSaveCourseNote(
                        courseId,
                        noteText,
                        updateCourseNote,
                        setIsNoted,
                        setIsSaving
                      );
                    }}
                  >
                    <Text style={currentStyle?.text_style}>
                      {isSaving ? '保存中...' : '完成'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </AnimatedFade>
      </View>
    );
  }
);

const ModalContent: React.FC<ModalContentProps> = memo(
  function ModalContent(props) {
    const {
      id,
      courseName,
      teacher,
      classroom,
      isThisWeek,
      week_duration,
      credit,
      class_when,
      date,
      is_official,
    } = props;
    const currentStyle = useVisualScheme(state => state.currentStyle);

    return (
      <View
        style={[
          styles.modalContainer,
          { width: 280 },
          { paddingHorizontal: 20 },
          { paddingVertical: 10 },
          currentStyle?.modal_background_style,
        ]}
      >
        <View style={styles.modalHeader}>
          <ThemeChangeText style={styles.modalTitle}>
            {courseName}
          </ThemeChangeText>
        </View>
        <View style={styles.modalSubtitleRow}>
          <Text style={styles.modalSubtitleText}>{credit}学分</Text>
          {!isThisWeek && (
            <View style={styles.notThisWeekTag}>
              <Text style={styles.notThisWeekText}>非本周</Text>
            </View>
          )}
        </View>

        <View style={styles.modalInfoGrid}>
          <View style={styles.modalInfoItem}>
            <View style={styles.modalInfoIcon}>
              <WeekIcon width={20} height={20} />
            </View>
            <Text style={[styles.modalInfoText, currentStyle?.text_style]}>
              {week_duration}
            </Text>
          </View>

          <View style={styles.modalInfoItem}>
            <View style={styles.modalInfoIcon}>
              <TimeIcon width={20} height={20} />
            </View>
            <Text style={[styles.modalInfoText, currentStyle?.text_style]}>
              周{date}
              {class_when}节
            </Text>
          </View>

          <View style={styles.modalInfoItem}>
            <View style={styles.modalInfoIcon}>
              <TeacherIcon width={20} height={20} />
            </View>
            <Text style={[styles.modalInfoText, currentStyle?.text_style]}>
              {teacher}
            </Text>
          </View>

          <View style={styles.modalInfoItem}>
            <View style={styles.modalInfoIcon}>
              <LocationIcon width={20} height={20} />
            </View>
            <Text style={[styles.modalInfoText, currentStyle?.text_style]}>
              {classroom}
            </Text>
          </View>
        </View>

        <ModalContentFooter
          is_official={is_official}
          courseId={id}
          currentStyle={currentStyle}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  modalContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    marginBottom: 8,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notThisWeekTag: {
    height: 20,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  notThisWeekText: {
    fontSize: 12,
    color: '#666',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalSubtitleRow: {
    height: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  modalSubtitleText: {
    height: 20,
    lineHeight: 20,
    fontSize: 14,
    color: '#666',
    marginRight: 6,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  modalInfoItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalInfoIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  modalInfoText: {
    fontSize: 14,
    color: '#333',
    maxWidth: '80%',
  },
  noteDisplayArea: {
    alignItems: 'flex-start',
  },
  icon: {
    flexShrink: 0,
  },
  noteInputArea: {
    alignItems: 'center',
  },
  noteInput: {
    width: '100%',
    minHeight: 80,
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E1E2F1',
    marginBottom: 24,
  },
  charCount: {
    position: 'absolute',
    bottom: 4,
    right: 0,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },

  noteActionsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  touchableBtn: {
    paddingVertical: 10,
  },
});

export default ModalContent;
