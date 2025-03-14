import { Icon, WingBlank } from '@ant-design/react-native';
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

const defaultCheckedList = ['a', 'b', 'c', 'd'];
const ScoreCalculation = () => {
  const local = useLocalSearchParams();
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [checkedList, setCheckedList] = useState<Set<string>>(
    new Set(defaultCheckedList)
  );
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(true);
  const [activeItem, setActiveItem] = useState<GradeData | null>(null);

  const { year, semester, type } = useLocalSearchParams();
  console.log(year, semester, type, 'year, semester, type');

  const onChange = (i: GradeData) => {
    const newCheckedList = new Set([...checkedList]);
    if (newCheckedList.has(i.key)) {
      newCheckedList.delete(i.key);
    } else {
      newCheckedList.add(i.key);
    }

    setCheckedList(newCheckedList);
    setIndeterminate(
      newCheckedList.size > 0 && newCheckedList.size < data.length
    );
    setCheckAll(newCheckedList.size === data.length);
  };

  const onCheckAllChange = (e: { target: { checked: boolean } }) => {
    const newCheckedList = e.target.checked
      ? new Set(Array.from(data).map((i: GradeData) => i.key))
      : new Set<string>();
    setCheckedList(newCheckedList);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  const showDetailModal = (i: GradeData) => {
    setActiveItem(i);
    Modal.show({
      mode: 'middle',
      showCancel: false,
      confirmText: '我知道了',
      children: (
        <View style={{ paddingVertical: 20, width: 290 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={styles.modalTitle}>{i.title}</Text>
            <Image
              style={{ width: 24, height: 24, borderRadius: 24 }}
              source={require('../../assets/images/mx-logo.png')}
            />
          </View>
          <View
            style={{
              alignItems: 'flex-start',
              paddingTop: 26,
              paddingHorizontal: 20,
            }}
          >
            <Text style={styles.textItem}>
              平时成绩（60%）:{' '}
              <Text style={styles.textColor}>{i.details?.usualGrade}</Text>
            </Text>
            <Text style={styles.textItem}>
              期末成绩（40%）:{' '}
              <Text style={styles.textColor}>{i.details?.finalGrade}</Text>
            </Text>
            <Text style={styles.textItem}>
              总成绩:{' '}
              <Text style={styles.textColor}>{i.details?.allGrade}</Text>
            </Text>
            <Text style={styles.textItem}>
              学分: <Text style={styles.textColor}>{i.details?.credit}</Text>
            </Text>
            <Text style={styles.textItem}>
              绩点: <Text style={styles.textColor}>{i.details?.score}</Text>
            </Text>
            <Text style={styles.textItem}>
              学分绩点:{' '}
              <Text style={styles.textColor}>{i.details?.creditScore}</Text>
            </Text>
          </View>
        </View>
      ),
    });
  };

  const calculateGPA = () => {
    let totalCreditScore = 0;
    let totalCredits = 0;

    data.forEach(item => {
      if (checkedList.has(item.key)) {
        totalCreditScore += item.details.allGrade * item.details.credit;
        totalCredits += item.details.credit;
      }
    });
    return totalCredits > 0
      ? Number((totalCreditScore / totalCredits).toFixed(4))
      : 0;
  };

  const showResultModal = () => {
    const gpa = calculateGPA();
    Modal.show({
      mode: 'middle',
      showCancel: false,
      confirmText: '我知道了',
      children: (
        <View style={{ paddingVertical: 20, width: 290 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 20, color: '#ABAAAA', fontWeight: '400' }}>
              计算结果
            </Text>
          </View>
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 64, color: '#000' }}>{gpa}</Text>
            <Text style={{ fontSize: 14, color: '#000' }}>平时学分绩</Text>
          </View>
        </View>
      ),
    });
  };

  const [data, setGradeData] = useState<GradeData[]>([]);

  useEffect(() => {
    queryGradeDetail({
      xqm: semester,
      xnm: year,
    }).then(res => {
      console.log(res, 'res');
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
        setCheckedList(
          new Set(transformedData.map((item: GradeData) => item.key))
        );
        setCheckAll(true);
      }
    });
  }, [semester, year]);

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: '#FFF',
          position: 'absolute',
          height: '100%',
        },
        currentStyle?.background_style,
      ]}
    >
      <StatusBar
        backgroundColor={currentStyle?.navbar_background_style as any}
      />
      <View style={[styles.head, currentStyle?.navbar_background_style]}>
        <View style={[styles.headerLeft]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              style={{ width: 24, height: 24 }}
              source={require('../../assets/images/arrow-left.png')}
            />
          </TouchableOpacity>
          <Text style={[styles.headText, currentStyle?.text_style]}>
            {local?.year}学年
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 18,
          }}
        >
          <Text style={currentStyle?.text_style}>全选：</Text>
          <TouchableOpacity
            onPress={() => onCheckAllChange({ target: { checked: !checkAll } })}
            style={[
              styles.checkbox,
              {
                backgroundColor: checkAll ? '#9379F6' : '#fff',
                borderColor: checkAll ? '#9379F6' : '#C7C7C7',
              },
            ]}
          >
            {checkAll && (
              <Icon
                name="check"
                size={20}
                color="#fff"
                style={{ fontWeight: '600' }}
              />
            )}
            {indeterminate && !checkAll && (
              <View style={styles.halfCheckBox}></View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <WingBlank style={{ marginTop: 26, marginBottom: 80 }}>
          {data.map(i => {
            const isChecked = checkedList.has(i.key);
            return (
              <TouchableOpacity
                key={i.key}
                style={[
                  styles.item,
                  activeItem?.key === i.key ? styles.activeItem : {},
                ]}
                onPress={() => showDetailModal(i)}
              >
                <View>
                  <View style={styles.itemLeft}>
                    <View style={styles.circle} />
                    <Text
                      style={[{ color: '#3D3D3D' }, currentStyle?.text_style]}
                    >
                      {i.title}
                    </Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={[styles.credit, currentStyle?.text_style]}>
                      学分：{i.credit}
                    </Text>
                    <Text style={{ color: '#969696' }}>成绩：{i.score}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => onChange(i)}
                  style={[styles.checkboxContainer]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: isChecked ? '#9379F6' : '#fff',
                        borderColor: isChecked ? '#9379F6' : '#C7C7C7',
                      },
                    ]}
                  >
                    {isChecked && (
                      <Icon
                        name="check"
                        size={20}
                        color="#fff"
                        style={{ fontWeight: '600' }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </WingBlank>
      </ScrollView>

      <View style={styles.bottomBtn}>
        <TouchableOpacity
          style={[styles.button, { borderRadius: 13 }]}
          onPress={showResultModal}
        >
          <Text style={styles.buttonText}>计算学分绩</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  head: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingTop: 40,
    paddingVertical: 6,
    backgroundColor: '#F7F7F7',
  },
  headerLeft: {
    flexDirection: 'row',
    justifyContent: 'center',
    textAlign: 'center',
  },
  headText: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '600',
    color: '#232323',
    marginLeft: 20,
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
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  halfCheckBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#9379F6',
  },
  item: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    fontSize: 14,
  },
  itemRight: {
    flexDirection: 'row',
    paddingLeft: 33,
    marginTop: 5,
    fontSize: 12,
  },
  credit: {
    color: '#969696',
    marginRight: 26,
  },
  circle: {
    width: 13,
    height: 13,
    borderRadius: 13,
    marginRight: 20,
    backgroundColor: '#7086F3',
  },
  activeItem: {
    backgroundColor: '#e9e3ff',
  },
  modalTitle: {
    fontWeight: '400',
    fontSize: 20,
    color: '#242424',
  },
  button: {
    backgroundColor: '#7878F8',
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textItem: {
    fontWeight: '400',
    fontSize: 18,
    color: '#707070',
    lineHeight: 26,
    paddingBottom: 11,
  },
  textColor: {
    color: '#9379F6',
  },
  bottomBtn: {
    position: 'absolute',
    bottom: 0,
    paddingBottom: 30,
    width: '100%',
    paddingHorizontal: 25,
  },
});

export default ScoreCalculation;
