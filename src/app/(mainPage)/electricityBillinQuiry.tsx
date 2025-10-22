// import { PickerView } from '@ant-design/react-native';
import PickerView from '@/components/pickerView/index';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getArchitecture, getRoomInfo } from '@/request/api/electricity';
import useVisualScheme from '@/store/visualScheme';

// 区域数据
const areaData = [
  { label: '东区', value: '东区学生宿舍' },
  { label: '西区', value: '西区学生宿舍' },
  { label: '元宝山', value: '元宝山学生宿舍' },
  { label: '南湖', value: '南湖学生宿舍' },
  { label: '国交', value: '国际园区' },
  // TODO 添加新区域
];

interface Architecture {
  architecture_id: string;
  architecture_name: string;
  base_floor: string;
  top_floor: string;
}

interface Room {
  room_id: string;
  room_name: string;
}

const ElectricityBillinQuiry = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  // 状态管理
  const [selectedArea, setSelectedArea] = useState('南湖学生宿舍');
  const [architectures, setArchitectures] = useState<Architecture[]>([]);
  const [floors, setFloors] = useState<{ label: string; value: string }[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [pickerValue, setPickerValue] = useState<[number, number]>([0, 0]);
  const [pickerValue2, setPickerValue2] = useState<[number]>([0]);

  const [loading, setLoading] = useState(false);

  // 加载楼栋数据
  // TODO 后端返回时不是完全顺序的, 可以前端根据 architecture_id 排序
  const loadArchitectures = async (area: string) => {
    try {
      setLoading(true);
      const response: any = await getArchitecture(area);
      const architectureList = response?.data?.architecture_list;

      if (architectureList && architectureList.length > 0) {
        setArchitectures(architectureList);

        const firstArch = architectureList[0];

        generateFloors(firstArch.base_floor, firstArch.top_floor);
        loadRooms(firstArch.architecture_id, firstArch.base_floor);
      } else {
        throw new Error('没有楼栋数据');
      }
    } catch (error) {
      console.error('加载楼栋数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 生成楼层数据
  const generateFloors = (baseFloor: string, topFloor: string) => {
    const base = parseInt(baseFloor);
    const top = parseInt(topFloor);
    const floorList = [];

    for (let i = base; i <= top; i++) {
      floorList.push({
        label: `${i}楼`,
        value: i.toString(),
      });
    }

    setFloors(floorList);
  };

  // 加载房间数据
  const loadRooms = async (architectureId: string, floor: string) => {
    try {
      const response: any = await getRoomInfo(architectureId, floor);

      // API 实际返回的是 data
      const roomList = response?.data?.room_list;

      console.log('房间数据响应:', response);
      console.log('房间列表:', roomList);

      if (roomList && roomList.length > 0) {
        setRooms(roomList);
      } else {
        throw new Error('没有房间数据');
      }
    } catch (error) {
      console.error('加载房间数据失败:', error);
      setRooms([]);
    }
  };

  // 初始化加载数据
  useEffect(() => {
    loadArchitectures(selectedArea);
  }, [selectedArea]);

  // 处理区域选择
  const handleAreaClick = (area: string) => {
    setSelectedArea(area);
    setPickerValue([0, 0]);
    setPickerValue2([0]);
  };

  // 处理楼栋和楼层选择
  const handleBuildingPickerChange = (value: any) => {
    setPickerValue(value);

    const archIndex = value[0] || 0;
    const floorIndex = value[1] || 0;

    if (architectures[archIndex]) {
      const selectedArch = architectures[archIndex];

      // 更新楼层数据
      generateFloors(selectedArch.base_floor, selectedArch.top_floor);

      // 加载对应楼层的房间数据
      const base = parseInt(selectedArch.base_floor);
      const selectedFloor = (base + floorIndex).toString();
      loadRooms(selectedArch.architecture_id, selectedFloor);
    }
  };

  // 处理房间选择
  const handleRoomPickerChange = (value: any) => {
    setPickerValue2(value);
  };

  // 准备楼栋 Picker 数据
  const buildingColumns = [
    architectures.map((arch, index) => ({
      label: arch.architecture_name,
      value: index,
    })),
    floors.map((floor, index) => ({
      label: floor.label,
      value: index,
    })),
  ];

  // 准备房间 Picker 数据
  const roomColumns = [
    rooms.map((room, index) => ({
      label: room.room_name,
      value: index,
    })),
  ];

  // 查询按钮处理
  const handleQuery = () => {
    const archIndex = pickerValue[0] || 0;
    const floorIndex = pickerValue[1] || 0;
    const roomIndex = pickerValue2[0] || 0;

    if (architectures.length === 0 || rooms.length === 0) {
      console.warn('数据未加载完成');
      return;
    }

    const selectedArch = architectures[archIndex];
    const selectedRoom = rooms[roomIndex];
    const base = parseInt(selectedArch.base_floor);
    const floor = base + floorIndex;

    const areaLabel =
      areaData.find(item => item.value === selectedArea)?.label || '';

    router.push({
      pathname: '/electricityBillinBalance',
      params: {
        building: `${areaLabel}${selectedArch.architecture_name}`,
        room: selectedRoom.room_name,
        area: selectedArea,
        room_id: selectedRoom.room_id,
      },
    });
  };

  const renderAddressItem = (item: { label: string; value: string }) => {
    return (
      <TouchableOpacity
        key={item.value}
        style={[
          styles.addressItem,
          currentStyle?.secondary_background_style,
          selectedArea === item.value ? currentStyle?.button_style : {},
        ]}
        onPress={() => handleAreaClick(item.value)}
      >
        <Text
          style={[
            styles.addressText,
            selectedArea === item.value ? currentStyle?.text_style : {},
          ]}
        >
          {item.label}
        </Text>
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
          <View
            style={[styles.addressContainer, currentStyle?.background_style]}
          >
            {areaData.map(item => renderAddressItem(item))}
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
          {loading ? (
            <Text style={styles.loadingText}>加载中...</Text>
          ) : architectures.length > 0 && floors.length > 0 ? (
            <PickerView
              data={buildingColumns}
              cascade={false}
              // value={pickerValue}
              onChange={handleBuildingPickerChange}
              style={{ height: 100 }}
              itemHeight={37}
              itemStyle={{
                paddingVertical: 9,
                borderRadius: 4,
              }}
            />
          ) : (
            <Text style={styles.loadingText}>
              {architectures.length === 0
                ? '暂无楼栋数据'
                : floors.length === 0
                  ? '暂无楼层数据'
                  : '加载中...'}
            </Text>
          )}
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
          {loading ? (
            <Text style={styles.loadingText}>加载中...</Text>
          ) : rooms.length > 0 ? (
            <PickerView
              data={roomColumns[0]}
              value={pickerValue2}
              onChange={handleRoomPickerChange}
              style={{ height: 100 }}
              cols={1}
              itemHeight={37}
              itemStyle={{
                paddingVertical: 9,
                borderRadius: 4,
              }}
            />
          ) : (
            <Text style={styles.loadingText}>暂无房间数据</Text>
          )}
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
        onPress={handleQuery}
        disabled={loading || architectures.length === 0 || rooms.length === 0}
      >
        <Text style={currentStyle?.button_text_style}>
          {loading ? '加载中...' : '查询'}
        </Text>
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
  },
  addressText: {
    fontWeight: '400',
    fontSize: 16,
    color: '#ABAAAA',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    paddingVertical: 20,
  },
});
