import { ActivityIndicator, Icon, WingBlank } from '@ant-design/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Modal from '@/components/modal';

import useVisualScheme from '@/store/visualScheme';

import { queryGradeDetail } from '@/request/api';

interface GradeDetails {
  usualGrade: string | number;
  finalGrade: string | number;
  allGrade: number;
  credit: number;
  score: number;
  creditScore: number;
}

interface GradeData {
  title: string;
  key: string;
  credit: number;
  score: string | number;
  details: GradeDetails;
}

const ScoreCalculation: React.FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set()
  );
  const [isPartiallySelected, setIsPartiallySelected] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<GradeData | null>(null);
  const [gradeData, setGradeData] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState(false);

  const { year, semester } = useLocalSearchParams();
  const yearNum = Number(year);
  const semesterNum = Number(semester);

  const handleCourseSelection = (course: GradeData) => {
    const newSelection = new Set([...selectedCourses]);
    if (newSelection.has(course.key)) {
      newSelection.delete(course.key);
    } else {
      newSelection.add(course.key);
    }

    setSelectedCourses(newSelection);
    updateSelectionState(newSelection);
  };

  const handleSelectAllToggle = (isSelected: boolean) => {
    const newSelection = isSelected
      ? new Set(gradeData.map(course => course.key))
      : new Set<string>();
    setSelectedCourses(newSelection);
    setIsPartiallySelected(false);
    setIsAllSelected(isSelected);
  };

  const updateSelectionState = (selection: Set<string>) => {
    const isPartial = selection.size > 0 && selection.size < gradeData.length;
    setIsPartiallySelected(isPartial);
    setIsAllSelected(selection.size === gradeData.length);
  };

  const showCourseDetails = (course: GradeData) => {
    setSelectedCourse(course);
    Modal.show({
      mode: 'middle',
      showCancel: false,
      confirmText: '我知道了',
      children: (
        <View style={{ paddingVertical: 20, width: 290 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{course.title}</Text>
            <Image
              style={styles.modalLogo}
              source={require('../../assets/images/mx-logo.png')}
            />
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.textItem}>
              平时成绩（60%）:{' '}
              <Text style={styles.textHighlight}>
                {course.details?.usualGrade}
              </Text>
            </Text>
            <Text style={styles.textItem}>
              期末成绩（40%）:{' '}
              <Text style={styles.textHighlight}>
                {course.details?.finalGrade}
              </Text>
            </Text>
            <Text style={styles.textItem}>
              总成绩:{' '}
              <Text style={styles.textHighlight}>
                {course.details?.allGrade}
              </Text>
            </Text>
            <Text style={styles.textItem}>
              学分:{' '}
              <Text style={styles.textHighlight}>{course.details?.credit}</Text>
            </Text>
            <Text style={styles.textItem}>
              绩点:{' '}
              <Text style={styles.textHighlight}>{course.details?.score}</Text>
            </Text>
            <Text style={styles.textItem}>
              学分绩点:{' '}
              <Text style={styles.textHighlight}>
                {course.details?.creditScore}
              </Text>
            </Text>
          </View>
        </View>
      ),
    });
  };

  const calculateAverageScore = () => {
    let totalWeightedScore = 0;
    let totalCredits = 0;

    gradeData.forEach(course => {
      if (selectedCourses.has(course.key)) {
        totalWeightedScore += course.details.allGrade * course.details.credit;
        totalCredits += course.details.credit;
      }
    });

    return totalCredits > 0
      ? Number((totalWeightedScore / totalCredits).toFixed(4))
      : 0;
  };

  const showResultModal = () => {
    const averageScore = calculateAverageScore();
    Modal.show({
      mode: 'middle',
      showCancel: false,
      confirmText: '我知道了',
      children: (
        <View style={{ paddingVertical: 20, width: 290 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.resultTitle}>计算结果</Text>
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultScore}>{averageScore}</Text>
            <Text style={styles.resultLabel}>平时学分绩</Text>
          </View>
        </View>
      ),
    });
  };

  useEffect(() => {
    setLoading(true);
    queryGradeDetail({
      xqm: semesterNum,
      xnm: yearNum,
    })
      .then(res => {
        if (res?.Grades) {
          interface Grade {
            Kcmc: string;
            Xf: number;
            Cj: string | number;
            RegularGrade: string | number;
            FinalGrade: string | number;
            Jd: number;
          }
          const transformedData = (res.Grades as Grade[]).map(
            (grade: Grade, index: number) => ({
              title: grade.Kcmc,
              key: index.toString(),
              credit: grade.Xf,
              score: grade.Cj,
              details: {
                usualGrade: grade.RegularGrade,
                finalGrade: grade.FinalGrade,
                allGrade: Number(grade.Cj),
                credit: grade.Xf,
                score: grade.Jd,
                creditScore: grade.Xf * grade.Jd,
              },
            })
          );

          setGradeData(transformedData);
          setSelectedCourses(
            new Set(transformedData.map(course => course.key))
          );
          setIsAllSelected(true);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('获取成绩失败:', error);
        setLoading(false);
      });
  }, [yearNum, semesterNum]);

  return (
    <View style={[styles.container, currentStyle?.background_style]}>
      <StatusBar
        backgroundColor={currentStyle?.navbar_background_style as any}
      />
      <View style={[styles.header, currentStyle?.navbar_background_style]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              style={styles.backIcon}
              source={require('../../assets/images/arrow-left.png')}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, currentStyle?.text_style]}>
            {yearNum}学年
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={currentStyle?.text_style}>全选：</Text>
          <TouchableOpacity
            onPress={() => handleSelectAllToggle(!isAllSelected)}
            style={[
              styles.checkbox,
              {
                backgroundColor: isAllSelected ? '#9379F6' : '#fff',
                borderColor: isAllSelected ? '#9379F6' : '#C7C7C7',
              },
            ]}
          >
            {isAllSelected && (
              <Icon
                name="check"
                size={20}
                color="#fff"
                style={styles.checkIcon}
              />
            )}
            {isPartiallySelected && !isAllSelected && (
              <View style={styles.partialCheckbox} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7878F8" />
          <Text style={[styles.loadingText, currentStyle?.text_style]}>
            加载中...
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <WingBlank style={styles.contentContainer}>
            {gradeData.map(course => {
              const isSelected = selectedCourses.has(course.key);
              return (
                <TouchableOpacity
                  key={course.key}
                  style={[
                    styles.courseItem,
                    selectedCourse?.key === course.key &&
                      styles.activeCourseItem,
                  ]}
                  onPress={() => showCourseDetails(course)}
                >
                  <View>
                    <View style={styles.courseHeader}>
                      <View style={styles.courseDot} />
                      <Text
                        style={[styles.courseTitle, currentStyle?.text_style]}
                      >
                        {course.title}
                      </Text>
                    </View>
                    <View style={styles.courseInfo}>
                      <Text
                        style={[styles.creditText, currentStyle?.text_style]}
                      >
                        学分：{course.credit}
                      </Text>
                      <Text style={styles.scoreText}>成绩：{course.score}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCourseSelection(course)}
                    style={styles.checkboxContainer}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: isSelected ? '#9379F6' : '#fff',
                          borderColor: isSelected ? '#9379F6' : '#C7C7C7',
                        },
                      ]}
                    >
                      {isSelected && (
                        <Icon
                          name="check"
                          size={20}
                          color="#fff"
                          style={styles.checkIcon}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </WingBlank>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.calculateButton]}
          onPress={showResultModal}
        >
          <Text style={styles.calculateButtonText}>计算学分绩</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingTop: 40,
    paddingVertical: 6,
    backgroundColor: '#F7F7F7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 18,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '600',
    color: '#232323',
    marginLeft: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    marginTop: 26,
    marginBottom: 80,
  },
  courseItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  activeCourseItem: {
    backgroundColor: '#e9e3ff',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  courseDot: {
    width: 13,
    height: 13,
    borderRadius: 13,
    marginRight: 20,
    backgroundColor: '#7086F3',
  },
  courseTitle: {
    fontSize: 14,
    color: '#3D3D3D',
  },
  courseInfo: {
    flexDirection: 'row',
    paddingLeft: 33,
    marginTop: 5,
    fontSize: 12,
  },
  creditText: {
    color: '#969696',
    marginRight: 26,
  },
  scoreText: {
    color: '#969696',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkIcon: {
    fontWeight: '600',
  },
  partialCheckbox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#9379F6',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLogo: {
    width: 24,
    height: 24,
    borderRadius: 24,
  },
  modalContent: {
    alignItems: 'flex-start',
    paddingTop: 26,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontWeight: '400',
    fontSize: 20,
    color: '#242424',
  },
  textItem: {
    fontWeight: '400',
    fontSize: 18,
    color: '#707070',
    lineHeight: 26,
    paddingBottom: 11,
  },
  textHighlight: {
    color: '#9379F6',
  },
  resultTitle: {
    fontSize: 20,
    color: '#ABAAAA',
    fontWeight: '400',
  },
  resultContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  resultScore: {
    fontSize: 64,
    color: '#000',
  },
  resultLabel: {
    fontSize: 14,
    color: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    paddingBottom: 30,
    width: '100%',
    paddingHorizontal: 25,
  },
  calculateButton: {
    backgroundColor: '#7878F8',
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 13,
  },
  calculateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScoreCalculation;
