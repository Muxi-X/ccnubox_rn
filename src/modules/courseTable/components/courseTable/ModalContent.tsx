import { Button } from '@ant-design/react-native';
import { router } from 'expo-router';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Modal from '@/components/modal';
import ThemeChangeText from '@/components/text';

import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import DeleteIcon from '@/assets/icons/calendar/delete.svg';
import EditIcon from '@/assets/icons/calendar/edit.svg';
import FailIcon from '@/assets/icons/calendar/fail.svg';
import LocationIcon from '@/assets/icons/calendar/location.svg';
import SuccessIcon from '@/assets/icons/calendar/success.svg';
import TeacherIcon from '@/assets/icons/calendar/teacher.svg';
import TimeIcon from '@/assets/icons/calendar/time.svg';
import WeekIcon from '@/assets/icons/calendar/week.svg';
import { deleteCourse } from '@/request/api/course';

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
        Modal.show({
          title: '删除成功',
          children: (
            <View
              style={{
                alignItems: 'center',
                gap: 10,
                paddingBottom: 20,
                width: 180,
              }}
            >
              <SuccessIcon height={150} width={150} />
              <Text style={{ fontSize: 20, textAlign: 'center' }}>
                课程已删除
              </Text>
            </View>
          ),
          mode: 'middle',
          showCancel: false,
        });
      }
    })
    .catch(err => {
      if (err.response.data.code === 50001) {
        Modal.show({
          title: '删除失败',
          children: (
            <View
              style={{
                alignItems: 'center',
                gap: 10,
                paddingBottom: 20,
                width: 180,
              }}
            >
              <FailIcon height={150} width={150} />
              <Text style={{ fontSize: 20, textAlign: 'center' }}>
                从教务系统导入的课程不支持删除
              </Text>
            </View>
          ),
          mode: 'middle',
          showCancel: false,
        });
      }
    });
}

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
                onConfirm: () => handleDeleteCourseConfirm(id),
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
                params: { id },
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
});

export default ModalContent;
