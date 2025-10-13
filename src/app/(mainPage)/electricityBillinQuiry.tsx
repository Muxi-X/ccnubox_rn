import { PickerView } from '@ant-design/react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import useVisualScheme from '@/store/visualScheme';
const bulldList = {
  a: '01栋',
  b: '02栋',
  c: '03栋',
  d: '04栋',
  e: '05栋',
  f: '06栋',
  g: '07栋',
};

const addressData = [
  {
    label: '东区',
    value: 1,
    children: [
      { label: '1栋', value: 'a' },
      { label: '2栋', value: 'b' },
      { label: '3栋', value: 'c' },
      { label: '4栋', value: 'd' },
      { label: '5栋', value: 'e' },
      { label: '6栋', value: 'f' },
      { label: '7栋', value: 'g' },
      { label: '8栋', value: 'h' },
      { label: '9栋', value: 'i' },
      { label: '10栋', value: 'j' },
      { label: '11栋', value: 'k' },
      { label: '12栋', value: 'l' },
      { label: '13栋东', value: 'm' },
      { label: '13栋西', value: 'n' },
      { label: '14栋', value: 'o' },
      { label: '15栋东', value: 'p' },
      { label: '15栋西', value: 'q' },
      { label: '16栋', value: 'r' },
      { label: '附1栋', value: 's' },
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
      { label: '5栋', value: 'e' },
      { label: '6栋', value: 'f' },
      { label: '7栋', value: 'g' },
      { label: '8栋', value: 'h' },
    ],
  },
  {
    label: '元宝山',
    value: 3,
    children: [
      { label: '1栋', value: 'a' },
      { label: '2栋', value: 'b' },
      { label: '3栋', value: 'c' },
      { label: '4栋', value: 'd' },
      { label: '5栋', value: 'e' },
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
      { label: '5栋', value: 'e' },
      { label: '6栋', value: 'f' },
      { label: '7栋', value: 'g' },
      { label: '8栋', value: 'h' },
      { label: '9栋', value: 'i' },
      { label: '10栋', value: 'j' },
      { label: '11栋', value: 'k' },
      { label: '12栋', value: 'l' },
      { label: '13栋', value: 'm' },
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
      { label: '5栋', value: 'e' },
      { label: '6栋', value: 'f' },
      { label: '7栋', value: 'g' },
      { label: '8栋', value: 'h' },
      { label: '9栋', value: 'i' },
    ],
  },
];

export const addressList = [
  {
    label: '1楼',
    value: 1,
    children: [
      { label: '101', value: '101' },
      { label: '102', value: '102' },
      { label: '103', value: '103' },
      { label: '104', value: '104' },
      { label: '105', value: '105' },
      { label: '106', value: '106' },
      { label: '107', value: '107' },
      { label: '108', value: '108' },
      { label: '109', value: '109' },
      { label: '110', value: '110' },
      { label: '111', value: '111' },
      { label: '112', value: '112' },
      { label: '113', value: '113' },
      { label: '114', value: '114' },
      { label: '115', value: '115' },
      { label: '116', value: '116' },
      { label: '117', value: '117' },
      { label: '118', value: '118' },
      { label: '119', value: '119' },
      { label: '120', value: '120' },
      { label: '121', value: '121' },
      { label: '122', value: '122' },
      { label: '123', value: '123' },
      { label: '124', value: '124' },
      { label: '125', value: '125' },
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
      { label: '205', value: '205' },
      { label: '206', value: '206' },
      { label: '207', value: '207' },
      { label: '208', value: '208' },
      { label: '209', value: '209' },
      { label: '210', value: '210' },
      { label: '211', value: '211' },
      { label: '212', value: '212' },
      { label: '213', value: '213' },
      { label: '214', value: '214' },
      { label: '215', value: '215' },
      { label: '216', value: '216' },
      { label: '217', value: '217' },
      { label: '218', value: '218' },
      { label: '219', value: '219' },
      { label: '220', value: '220' },
      { label: '221', value: '221' },
      { label: '222', value: '222' },
      { label: '223', value: '223' },
      { label: '224', value: '224' },
      { label: '225', value: '225' },
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
      { label: '305', value: '305' },
      { label: '306', value: '306' },
      { label: '307', value: '307' },
      { label: '308', value: '308' },
      { label: '309', value: '309' },
      { label: '310', value: '310' },
      { label: '311', value: '311' },
      { label: '312', value: '312' },
      { label: '313', value: '313' },
      { label: '314', value: '314' },
      { label: '315', value: '315' },
      { label: '316', value: '316' },
      { label: '317', value: '317' },
      { label: '318', value: '318' },
      { label: '319', value: '319' },
      { label: '320', value: '320' },
      { label: '321', value: '321' },
      { label: '322', value: '322' },
      { label: '323', value: '323' },
      { label: '324', value: '324' },
      { label: '325', value: '325' },
    ],
  },
  {
    label: '4楼',
    value: 4,
    children: [
      { label: '401', value: '401' },
      { label: '402', value: '402' },
      { label: '403', value: '403' },
      { label: '404', value: '404' },
      { label: '405', value: '405' },
      { label: '406', value: '406' },
      { label: '407', value: '407' },
      { label: '408', value: '408' },
      { label: '409', value: '409' },
      { label: '410', value: '410' },
      { label: '411', value: '411' },
      { label: '412', value: '412' },
      { label: '413', value: '413' },
      { label: '414', value: '414' },
      { label: '415', value: '415' },
      { label: '416', value: '416' },
      { label: '417', value: '417' },
      { label: '418', value: '418' },
      { label: '419', value: '419' },
      { label: '420', value: '420' },
      { label: '421', value: '421' },
      { label: '422', value: '422' },
      { label: '423', value: '423' },
      { label: '424', value: '424' },
      { label: '425', value: '425' },
    ],
  },
  {
    label: '5楼',
    value: 5,
    children: [
      { label: '501', value: '501' },
      { label: '502', value: '502' },
      { label: '503', value: '503' },
      { label: '504', value: '504' },
      { label: '505', value: '505' },
      { label: '506', value: '506' },
      { label: '507', value: '507' },
      { label: '508', value: '508' },
      { label: '509', value: '509' },
      { label: '510', value: '510' },
      { label: '511', value: '511' },
      { label: '512', value: '512' },
      { label: '513', value: '513' },
      { label: '514', value: '514' },
      { label: '515', value: '515' },
      { label: '516', value: '516' },
      { label: '517', value: '517' },
      { label: '518', value: '518' },
      { label: '519', value: '519' },
      { label: '520', value: '520' },
      { label: '521', value: '521' },
      { label: '522', value: '522' },
      { label: '523', value: '523' },
      { label: '524', value: '524' },
      { label: '525', value: '525' },
    ],
  },
  {
    label: '6楼',
    value: 6,
    children: [
      { label: '601', value: '601' },
      { label: '602', value: '602' },
      { label: '603', value: '603' },
      { label: '604', value: '604' },
      { label: '605', value: '605' },
      { label: '606', value: '606' },
      { label: '607', value: '607' },
      { label: '608', value: '608' },
      { label: '609', value: '609' },
      { label: '610', value: '610' },
      { label: '611', value: '611' },
      { label: '612', value: '612' },
      { label: '613', value: '613' },
      { label: '614', value: '614' },
      { label: '615', value: '615' },
      { label: '616', value: '616' },
      { label: '617', value: '617' },
      { label: '618', value: '618' },
      { label: '619', value: '619' },
      { label: '620', value: '620' },
      { label: '621', value: '621' },
      { label: '622', value: '622' },
      { label: '623', value: '623' },
      { label: '624', value: '624' },
      { label: '625', value: '625' },
    ],
  },
  {
    label: '7楼',
    value: 7,
    children: [
      { label: '701', value: '701' },
      { label: '702', value: '702' },
      { label: '703', value: '703' },
      { label: '704', value: '704' },
      { label: '705', value: '705' },
      { label: '706', value: '706' },
      { label: '707', value: '707' },
      { label: '708', value: '708' },
      { label: '709', value: '709' },
      { label: '710', value: '710' },
      { label: '711', value: '711' },
      { label: '712', value: '712' },
      { label: '713', value: '713' },
      { label: '714', value: '714' },
      { label: '715', value: '715' },
      { label: '716', value: '716' },
      { label: '717', value: '717' },
      { label: '718', value: '718' },
      { label: '719', value: '719' },
      { label: '720', value: '720' },
      { label: '721', value: '721' },
      { label: '722', value: '722' },
      { label: '723', value: '723' },
      { label: '724', value: '724' },
      { label: '725', value: '725' },
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
    //console.log(val);
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
          // {
          //   building: '南湖05栋',
          //   room: '425',
          //   userId: '1',
          //   area: '南湖学生宿舍',
          //   student_id: '2023215228',
          // }

          // 获取区域名称，默认为"南湖"
          const areaName =
            addressData.find(item => item.value === address)?.label || '南湖';
          //    console.log(pickerValue, 'pickerValue', pickerValue2);
          // 获取楼栋号，默认为"05"
          const buildingNumber = pickerValue?.[1] || 'e';
          const buildingName = areaName + bulldList?.[buildingNumber];

          // 获取房间号，默认为"425"
          const roomNumber = pickerValue2?.[1] || '425';

          // console.log(
          //   {
          //     building: buildingName,
          //     room: roomNumber,
          //     area: areaName + '学生宿舍',
          //   },
          //   'press'
          // );
          router.push({
            pathname: '/electricityBillinBalance',
            params: {
              building: buildingName,
              room: roomNumber,
              area: areaName + '学生宿舍',
            },
          });
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
