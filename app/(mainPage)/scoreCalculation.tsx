import { Icon, Modal, WingBlank } from '@ant-design/react-native';
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

import useVisualScheme from '@/store/visualScheme';

import { queryGradeDetail } from '@/request/api';

const defaultCheckedList = ['a', 'b', 'c', 'd'];

const ScoreCalculation = () => {
  const local = useLocalSearchParams();
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [checkedList, setCheckedList] = useState<any>(
    new Set(defaultCheckedList)
  ); // 初始选中项
  const [indeterminate, setIndeterminate] = useState(false); // 半选状态
  const [checkAll, setCheckAll] = useState(true); // 全选状态
  const [visible1, setVisible1] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [activeItem, setActiveItem] = useState<any>({});
  const [calculatedGPA, setCalculatedGPA] = useState<number>(0);

  const { year, semester, type } = useLocalSearchParams();
  console.log(year, semester, type, 'year, semester, type');

  // 处理单个复选框的选中和取消选中
  const onChange = (i: any) => {
    const newCheckedList = new Set(checkedList); // 使用副本来更新
    if (newCheckedList.has(i.key)) {
      newCheckedList.delete(i.key); // 如果选中，取消选中
    } else {
      newCheckedList.add(i.key); // 如果没有选中，添加到选中列表
    }

    setCheckedList(newCheckedList);
    // 更新半选和全选状态
    setIndeterminate(
      newCheckedList.size > 0 && newCheckedList.size < data.length
    );
    setCheckAll(newCheckedList.size === data.length);
  };

  // 处理全选框的选中与取消全选
  const onCheckAllChange = (e: { target: { checked: boolean } }) => {
    const newCheckedList = e.target.checked
      ? new Set(data.map(i => i.key))
      : new Set();
    setCheckedList(newCheckedList);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };
  const handleClick = (i: any) => {
    setActiveItem(i);
    setVisible1(true);
  };
  const [data, setGradeData] = useState<any[]>([]);

  useEffect(() => {
    queryGradeDetail({
      xqm: semester,
      xnm: year,
    }).then(res => {
      console.log(res, 'res');
      if (res.Grades) {
        // Transform the Grades array into the expected data structure
        const transformedData = res.Grades.map((grade: any, index: number) => ({
          title: grade.Kcmc,
          key: index.toString(),
          credit: grade.Xf,
          score: grade.Cj,
          details: {
            usualGrade: grade.RegularGrade,
            finalGrade: grade.FinalGrade,
            allGrade: grade.Cj,
            credit: grade.Xf,
            score: grade.Jd,
            creditScore: grade.Xf * grade.Jd,
          },
        }));

        setGradeData(transformedData);
        // Initialize checkedList with all keys
        setCheckedList(new Set(transformedData.map((item: any) => item.key)));
        setCheckAll(true);
      }
    });
  }, [semester, year]);

  // Add calculation function
  const calculateGPA = () => {
    let totalCreditScore = 0;
    let totalCredits = 0;

    data.forEach(item => {
      // Only calculate for checked items
      if (checkedList.has(item.key)) {
        totalCreditScore += item.details.creditScore;
        totalCredits += item.details.credit;
      }
    });

    // Calculate GPA with 4 decimal places
    const gpa =
      totalCredits > 0
        ? (totalCreditScore / totalCredits).toFixed(4)
        : '0.0000';
    setCalculatedGPA(Number(gpa));
  };

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
          {/* 自定义全选复选框 */}
          <TouchableOpacity
            onPress={() => onCheckAllChange({ target: { checked: !checkAll } })}
            style={[
              styles.checkbox,
              {
                backgroundColor: checkAll
                  ? '#9379F6' // 选中时背景色
                  : '#fff', // 未选中时背景色
                borderColor: checkAll ? '#9379F6' : '#C7C7C7', // 选中时边框紫色，未选中时灰色
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
            const isChecked = checkedList.has(i.key); // 是否选中
            return (
              <TouchableOpacity
                key={i.key}
                style={[
                  styles.item,
                  activeItem.key === i.key ? styles.activeItem : {},
                ]}
                onPress={() => handleClick(i)}
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
                  onPress={() => onChange(i)} // 点击时触发选中状态变化
                  style={[styles.checkboxContainer]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: isChecked ? '#9379F6' : '#fff', // 选中时紫色，未选中时白色
                        borderColor: isChecked ? '#9379F6' : '#C7C7C7', // 选中时紫色，未选中时灰色
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
          onPress={() => {
            calculateGPA();
            setVisible2(true);
          }}
        >
          <Text style={styles.buttonText}>计算学分绩</Text>
        </TouchableOpacity>
      </View>
      <Modal
        transparent
        onClose={() => setVisible1(false)}
        maskClosable
        visible={visible1}
        style={styles.modal}
      >
        <View style={{ paddingVertical: 20, width: 290 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={styles.modalTitle}>{activeItem.title}</Text>
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
              <Text style={styles.textColor}>
                {activeItem.details?.usualGrade}
              </Text>
            </Text>
            <Text style={styles.textItem}>
              期末成绩（40%）:{' '}
              <Text style={styles.textColor}>
                {activeItem.details?.finalGrade}
              </Text>
            </Text>
            <Text style={styles.textItem}>
              总成绩:{' '}
              <Text style={styles.textColor}>
                {activeItem.details?.allGrade}
              </Text>
            </Text>
            <Text style={styles.textItem}>
              学分:{' '}
              <Text style={styles.textColor}>{activeItem.details?.credit}</Text>
            </Text>
            <Text style={styles.textItem}>
              绩点:{' '}
              <Text style={styles.textColor}>{activeItem.details?.score}</Text>
            </Text>
            <Text style={styles.textItem}>
              学分绩点:{' '}
              <Text style={styles.textColor}>
                {activeItem.details?.creditScore}
              </Text>
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.button, { width: 110, borderRadius: 25 }]}
            onPress={() => {
              setVisible1(false);
            }}
          >
            <Text style={styles.buttonText}>我知道了</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
        transparent
        onClose={() => setVisible2(false)}
        maskClosable
        visible={visible2}
        style={styles.modal}
      >
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
            <Text style={{ fontSize: 64, color: '#000' }}>{calculatedGPA}</Text>
            <Text style={{ fontSize: 14, color: '#000' }}>平时学分绩</Text>
          </View>
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.button, { width: 110, borderRadius: 25 }]}
            onPress={() => {
              setVisible2(false);
            }}
          >
            <Text style={styles.buttonText}>我知道了</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    borderRadius: 4, // 正方形边框，边角微微圆润
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
    width: 12, // 缩小的方框
    height: 12,
    borderRadius: 2, // 小方框有圆角
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
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 320,
    borderRadius: 10,
    zIndex: 1000,
  },
  modalTitle: {
    fontWeight: '400',
    fontSize: 20,
    color: '#242424',
  },
  button: {
    backgroundColor: '#7878F8', // 按钮背景色
    paddingVertical: 12, // 按钮的上下内边距
    paddingHorizontal: 14, // 按钮的左右内边距
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
