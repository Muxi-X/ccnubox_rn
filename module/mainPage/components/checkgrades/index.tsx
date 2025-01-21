import { Picker } from '@ant-design/react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';


const data1 = [
  {
    value: '2023-2024',
    label: '2023-2024',
  },
  {
    value: '2022-2023',
    label: '2022-2023',
  },
  {
    value: '2021-2022',
    label: '2021-2022',
  },
];
const data2 = [
  {
    value: '第一学期',
    label: '第一学期',
  },
  {
    value: '第二学期',
    label: '第二学期',
  },
];
const data3 = [
  {
    value: '全部',
    label: '全部',
  },
  {
    value: '其他',
    label: '其他',
  },
];
const CheckGrades = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [value1, setValue1] = useState(['2023-2024']);
  const [value2, setValue2] = useState(['第一学期']);
  const [value3, setValue3] = useState(['全部']);
  const [visible1, setVisible1] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [visible3, setVisible3] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={[styles.item, styles.itemBorder]}
        onPress={() => setVisible1(true)}
      >
        <Image
          style={{ width: 35, height: 35, marginRight: 34 }}
          source={require('../../../../assets/images/xuenian.png')}
        />
        <View>
          <Text
            style={{
              marginBottom: 1,
              fontSize: 14,
              color: currentStyle?.text_style?.color,
            }}
          >
            选择学年
          </Text>
          <Text style={{ color: '#969696', fontSize: 12 }}>{value1[0]}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.item, styles.itemBorder]}
        onPress={() => setVisible2(true)}
      >
        <Image
          style={{ width: 35, height: 35, marginRight: 34 }}
          source={require('../../../../assets/images/xueqi.png')}
        />
        <View>
          <Text
            style={[
              {
                marginBottom: 1,
                fontSize: 14,
                color: currentStyle?.text_style?.color,
              },
            ]}
          >
            选择学期
          </Text>
          <Text style={{ color: '#969696', fontSize: 12 }}>{value2[0]}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => setVisible3(true)}>
        <Image
          style={{ width: 35, height: 35, marginRight: 34 }}
          source={require('../../../../assets/images/zhonglei.png')}
        />
        <View>
          <Text
            style={{
              marginBottom: 1,
              fontSize: 14,
              color: currentStyle?.text_style?.color,
            }}
          >
            选择课程种类
          </Text>
          <Text style={{ color: '#969696', fontSize: 12 }}> {value3[0]}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          width: 309,
          height: 46,
          backgroundColor: '#7878F8',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto',
          borderRadius: 10,
          marginTop: 26,
        }}
        onPress={() => {
          router.push({
            pathname: '/scoreCalculation',
            params: { year: value1[0], semester: value2[0], type: value3[0] },
          });
        }}
      >
        <Text style={{ color: '#FFFFFF' }}>查询</Text>
      </TouchableOpacity>
      <Picker
        visible={visible1}
        onVisibleChange={(val: boolean) => setVisible1(val)}
        data={data1}
        cols={3}
        value={value1}
        onChange={(val: any) => setValue1(val)}
      ></Picker>
      <Picker
        visible={visible2}
        onVisibleChange={(val: boolean) => setVisible2(val)}
        data={data2}
        cols={3}
        value={value2}
        onChange={(val: any) => setValue2(val)}
      ></Picker>
      <Picker
        visible={visible3}
        onVisibleChange={(val: boolean) => setVisible3(val)}
        data={data3}
        cols={3}
        value={value3}
        onChange={(val: any) => setValue3(val)}
      ></Picker>
    </View>
  );
};
export default CheckGrades;

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#D8D8D8',
  },
});
