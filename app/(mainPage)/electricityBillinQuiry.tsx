import { PickerView } from '@ant-design/react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import useVisualScheme from '@/store/visualScheme';
const addressData = [
  {
    label: '东区',
    value: 1,
    children: [
      { label: '1栋', value: 'a' },
      { label: '2栋', value: 'b' },
      { label: '3栋', value: 'c' },
      { label: '4栋', value: 'd' },
    ],
  },
  {
    label: '西区',
    value: 2,
    children: [
      { label: '1栋', value: 'a' },
      { label: '2栋', value: 'b' },
      { label: '3栋', value: 'c' },
      { label: '4栋', value: 'd' },
    ],
  },
  {
    label: '宝山',
    value: 3,
    children: [
      { label: '1栋', value: 'a' },
      { label: '2栋', value: 'b' },
      { label: '3栋', value: 'c' },
      { label: '4栋', value: 'd' },
    ],
  },
  {
    label: '南湖',
    value: 4,
    children: [
      { label: '1栋', value: 'a' },
      { label: '2栋', value: 'b' },
      { label: '3栋', value: 'c' },
      { label: '4栋', value: 'd' },
    ],
  },
  {
    label: '国交',
    value: 5,
    children: [
      { label: '1栋', value: 'a' },
      { label: '2栋', value: 'b' },
      { label: '3栋', value: 'c' },
      { label: '4栋', value: 'd' },
    ],
  },
  {
    label: '国交',
    value: 6,
    children: [
      { label: '1栋', value: 'a' },
      { label: '2栋', value: 'b' },
      { label: '3栋', value: 'c' },
      { label: '4栋', value: 'd' },
    ],
  },
  {
    label: '国交',
    value: 7,
    children: [
      { label: '1栋', value: 'a' },
      { label: '2栋', value: 'b' },
      { label: '3栋', value: 'c' },
      { label: '4栋', value: 'd' },
    ],
  },
];
const addressList = [
  {
    label: '1楼',
    value: 1,
    children: [
      { label: '101', value: '101' },
      { label: '102', value: '102' },
      { label: '103', value: '103' },
      { label: '104', value: '104' },
    ],
  },
  {
    label: '2楼',
    value: 2,
    children: [
      { label: '201', value: '201' },
      { label: '202', value: '202' },
      { label: '203', value: '203' },
      { label: '204', value: '204' },
    ],
  },
  {
    label: '3楼',
    value: 3,
    children: [
      { label: '301', value: '301' },
      { label: '302', value: '302' },
      { label: '303', value: '303' },
      { label: '304', value: '304' },
    ],
  },
  {
    label: '4楼',
    value: 4,
    children: [
      { label: '401', value: '401' },
      { label: '402', value: '402' },
    ],
  },
];
const ElectricityBillinQuiry = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [address, setAddress] = useState(1);
  const [pickerValue, setPickerValue] = useState(undefined);
  const [pickerValue2, setPickerValue2] = useState<any>(undefined);
  const addressItem = addressData.find(item => item.value === address);
  const columns: any = [[addressItem], addressItem?.children];
  const handleAddressClick = (val: any) => {
    setAddress(val.value);
  };
  const handlePickerChange = (val: any) => {
    console.log(val);
    setPickerValue(val);
  };

  const handlePickerChange2 = (val: any) => {
    setPickerValue2(val);
  };
  const renderAddressItem = (item: any) => {
    return (
      <TouchableOpacity
        key={item.value}
        style={[
          styles.addressItem,
          address === item.value ? styles.addressItemActive : {},
        ]}
        onPress={() => handleAddressClick(item)}
      >
        <Text>{item.label}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={[styles.container, currentStyle?.background_style]}>
      <View>
        <View style={styles.title1}>
          <Text style={[styles.text1, currentStyle?.text_style]}>选择区域</Text>
          <Image
            style={{ width: 17, height: 21 }}
            source={require('../../assets/images/area.png')}
          />
        </View>
        <ScrollView horizontal style={{ marginBottom: 39 }}>
          <View style={styles.addressContainer}>
            {addressData.map(item => renderAddressItem(item))}
          </View>
        </ScrollView>
      </View>
      <View>
        <View style={styles.title1}>
          <Text style={[styles.text1, currentStyle?.text_style]}>选择楼栋</Text>
          <Image
            style={{ width: 17, height: 21 }}
            source={require('../../assets/images/building.png')}
          />
        </View>
        <View style={{ paddingTop: 8, paddingBottom: 34 }}>
          <PickerView
            data={columns}
            cascade={false}
            value={pickerValue}
            onChange={handlePickerChange}
            style={{ height: 100 }}
            itemHeight={37}
            itemStyle={{
              paddingVertical: 9,
              backgroundColor: '#F5F5F5',
              borderRadius: 4,
            }}
          />
        </View>
      </View>
      <View>
        <View style={styles.title1}>
          <Text style={[styles.text1, currentStyle?.text_style]}>选择寝室</Text>
          <Image
            style={{ width: 17, height: 21 }}
            source={require('../../assets/images/dormitory.png')}
          />
        </View>
        <View style={{ paddingTop: 8 }}>
          <PickerView
            data={addressList}
            value={pickerValue2}
            onChange={handlePickerChange2}
            style={{ height: 100 }}
            cols={2}
            itemHeight={37}
            itemStyle={{
              paddingVertical: 9,
              backgroundColor: '#F5F5F5',
              borderRadius: 4,
            }}
          />
        </View>
      </View>
      <TouchableOpacity
        style={[
          {
            width: 309,
            height: 46,
            backgroundColor: '#7878F8',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto',
            borderRadius: 10,
          },
          currentStyle?.button_style,
        ]}
        onPress={() => {
          router.push('/electricityBillBalance');
        }}
      >
        <Text style={currentStyle?.button_text_style}>查询</Text>
      </TouchableOpacity>
    </View>
  );
};
export default ElectricityBillinQuiry;
const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingHorizontal: 22,
    paddingVertical: 25,
    backgroundColor: '#FFF',
  },
  title1: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  text1: {
    fontFamily: 'Source Han Sans, Source Han Sans',
    fontWeight: '400',
    fontSize: 16,
    color: '#000000',
    marginRight: 10,
    marginBottom: 13,
  },
  addressContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  addressItem: {
    width: 61,
    height: 65,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '400',
    fontSize: 16,
    color: '#ABAAAA',
  },
  addressItemActive: {
    color: '#FFFFFF',
    backgroundColor: '#BAB9FC',
  },
});
