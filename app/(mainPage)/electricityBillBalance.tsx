import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import { queryElectricityPrice, setElectricityPrice } from '@/request/api';

const ElectricityBillBalance = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [electricityRate, setElectricityRate] = useState('');
  const [elecInfo, setElecInfo] = useState({
    lighting_price: 0,
    lighting_garde: 0,
    air_price: 0,
    air_garde: 0,
    lighting_rest: 0,
    air_rest: 0,
  });
  useEffect(() => {
    queryElectricityPrice({
      building: '南湖05栋',
      room: '425',
      userId: '1',
      area: '南湖学生宿舍',
      student_id: '2023215228',
    })
      .then(res => {
        if (res?.code === 10000) {
          console.log('查询成功，电费信息：' + JSON.stringify(res.data));
          setElecInfo(res.data);
        }
      })
      .catch(error => {
        console.log('查询失败：' + error.message);
      });
  }, []);
  //设置电费
  const handleSetElectricityPrice = () => {
    setElectricityPrice({
      building: '南湖05栋',
      room: '425',
      userId: '1',
      area: '南湖学生宿舍',
      student_id: '2023215228',
      money: electricityRate,
    })
      .then(response => {
        console.log('设置成功', response);
      })
      .catch(error => {
        console.log('设置失败：' + error.message);
      });
  };
  return (
    <View style={[styles.container, currentStyle?.background_style]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, currentStyle?.text_style]}>
            南湖 1栋 105
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.btn, currentStyle?.button_style]}
          onPress={() => {}}
        >
          <Text style={currentStyle?.button_text_style}>更换宿舍</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.topLeft}>
              <Image
                style={{ width: 35, height: 42, marginRight: 11 }}
                source={require('../../assets/images/zhaoming.png')}
              />
              <Text style={[styles.text1, currentStyle?.text_style]}>照明</Text>
            </View>
            <View style={styles.topRight}>
              <Text style={[styles.text2, currentStyle?.text_style]}>
                ￥{elecInfo.lighting_rest}
              </Text>
            </View>
          </View>
          <View style={styles.cardBottom}>
            <View>
              <Text style={currentStyle?.text_style}>
                昨日用电：{elecInfo.lighting_garde}度
              </Text>
            </View>
            <Text style={currentStyle?.text_style}>
              昨日电费：{elecInfo.lighting_price}元
            </Text>
            <View></View>
          </View>
        </View>
        <View style={[styles.card, { backgroundColor: '#BAB9FC' }]}>
          <View style={styles.cardTop}>
            <View style={styles.topLeft}>
              <Image
                style={{ width: 35, height: 42, marginRight: 11 }}
                source={require('../../assets/images/kongtiao.png')}
              />
              <Text style={[styles.text1, currentStyle?.text_style]}>空调</Text>
            </View>
            <View style={styles.topRight}>
              <Text style={[styles.text2, currentStyle?.text_style]}>
                ￥{elecInfo.air_rest}
              </Text>
            </View>
          </View>
          <View style={styles.cardBottom}>
            <View>
              <Text style={currentStyle?.text_style}>
                昨日用电：{elecInfo.air_garde}度
              </Text>
            </View>
            <Text style={currentStyle?.text_style}>
              昨日电费：{elecInfo.air_price}元
            </Text>
            <View></View>
          </View>
        </View>
        <View style={[styles.card, { backgroundColor: '#BBE5FB' }]}>
          <View style={[styles.cardTop]}>
            <Image
              style={{ width: 35, height: 42, marginRight: 28 }}
              source={require('../../assets/images/tishi.png')}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[{ fontSize: 18 }, currentStyle?.text_style]}>
                电费标准设置：
              </Text>
              <TextInput
                style={styles.input}
                value={electricityRate}
                onChangeText={text => setElectricityRate(text)}
                keyboardType="numeric"
                onBlur={() => handleSetElectricityPrice()} // 失去焦点时触发设置电费操作
                onKeyPress={event => {
                  if (event.nativeEvent.key === 'Enter') {
                    // 判断是否按下回车键
                    handleSetElectricityPrice();
                  }
                }}
              />
              <Text style={[{ fontSize: 18 }, currentStyle?.text_style]}>
                元
              </Text>
            </View>
          </View>
          <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
            <Text style={[{ fontSize: 12 }, currentStyle?.text_style]}>
              一旦低于电费低于此标准，将推送电费告急提醒喔~
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
export default ElectricityBillBalance;
const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingHorizontal: 22,
    paddingVertical: 25,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 17,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: '#D8D8D8',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '500',
    fontSize: 20,
    color: '#9379F6',
  },
  btn: {
    backgroundColor: '#B6B5FF',
    fontWeight: '400',
    fontSize: 12,

    paddingHorizontal: 18,
    paddingVertical: 3,
    borderRadius: 20,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 37,
  },
  card: {
    paddingHorizontal: 13,
    paddingBottom: 10,
    paddingTop: 22,
    backgroundColor: '#FFE297',
    borderRadius: 12,
    marginBottom: 35,
  },
  cardTop: {
    marginBottom: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
  },
  topLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text1: {
    fontWeight: '500',
    fontSize: 24,
    color: '#3D3D3D',
  },
  topRight: {
    flex: 1,
  },
  text2: {
    fontWeight: '500',
    fontSize: 36,
    color: '#000000',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: '400',
    fontSize: 12,
    color: '#3D3D3D',
  },
  input: {
    height: 40,
    minWidth: 60,
    borderColor: 'gray',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    flex: 1,
  },
});
