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

import PickerView from '@/components/pickerView/index';
import { getArchitecture, getRoomInfo } from '@/request/api/electricity';
import { useElectricityStore } from '@/store/electricity';
import useVisualScheme from '@/store/visualScheme';
import { log } from '@/utils/logger';

// 区域数据
const areaData = [
  { label: '东区', value: '东区学生宿舍' },
  { label: '西区', value: '西区学生宿舍' },
  { label: '南湖', value: '南湖学生宿舍' },
  { label: '元宝山', value: '元宝山学生宿舍' },
  { label: '东南区', value: '东南区学生宿舍' },
  { label: '国交', value: '国际园区' },
];

interface Architecture {
  architecture_id: string;
  architecture_name: string;
  base_floor: string;
  top_floor: string;
}

interface Room {
  room_name: string;
  ac?: string;
  light?: string;
  union?: string;
}

const ElectricityInquiry = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const selectedDorm = useElectricityStore(state => state.selectedDorm);
  const setSelectedDorm = useElectricityStore(state => state.setSelectedDorm);

  // 状态管理：区域默认优先使用缓存值
  const [selectedArea, setSelectedArea] = useState(
    () => selectedDorm?.area || '南湖学生宿舍'
  );
  const [architectures, setArchitectures] = useState<Architecture[]>([]);
  const [floors, setFloors] = useState<{ label: string; value: string }[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [pickerValue, setPickerValue] = useState<[number, number]>([0, 0]);
  const [pickerValue2, setPickerValue2] = useState<[number]>([0]);

  const [loading, setLoading] = useState(false);

  // 加载楼栋数据
  const loadArchitectures = async (area: string) => {
    try {
      setLoading(true);
      const response: any = await getArchitecture(area);
      const architectureList =
        response?.data?.architecture_list || response?.msg?.architecture_list;

      if (architectureList && architectureList.length > 0) {
        setArchitectures(architectureList);

        // 如果所选区域匹配缓存数据，优先匹配缓存的楼栋
        const isCachedArea = area === selectedDorm?.area;
        let matchedArchIndex = 0;
        if (
          isCachedArea &&
          (selectedDorm?.architecture_id || selectedDorm?.building)
        ) {
          const foundIdx = architectureList.findIndex(
            (a: any) =>
              (selectedDorm.architecture_id &&
                a.architecture_id === selectedDorm.architecture_id) ||
              (selectedDorm.building &&
                (a.architecture_name === selectedDorm.building ||
                  selectedDorm.building.includes(a.architecture_name)))
          );
          if (foundIdx >= 0) {
            matchedArchIndex = foundIdx;
          }
        }

        const targetArch = architectureList[matchedArchIndex];
        const floorList = generateFloors(
          targetArch.base_floor,
          targetArch.top_floor
        );

        // 优先匹配缓存的楼层
        let matchedFloorIndex = 0;
        if (isCachedArea && selectedDorm?.floor) {
          const foundFloorIdx = floorList.findIndex(
            f => f.value === selectedDorm.floor
          );
          if (foundFloorIdx >= 0) {
            matchedFloorIndex = foundFloorIdx;
          }
        }

        setPickerValue([matchedArchIndex, matchedFloorIndex]);

        const initialFloor =
          floorList[matchedFloorIndex]?.value ?? targetArch.base_floor ?? '1';

        // 加载房间并尝试匹配缓存的房间
        await loadRooms(
          targetArch.architecture_id,
          initialFloor,
          isCachedArea ? selectedDorm?.room : undefined
        );
      } else {
        setArchitectures([]);
        setFloors([]);
        setRooms([]);
      }
    } catch (error) {
      setArchitectures([]);
      setFloors([]);
      setRooms([]);
      log.error('加载楼栋数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 生成楼层数据
  const generateFloors = (baseFloor?: string, topFloor?: string) => {
    let base = parseInt(String(baseFloor ?? '1'), 10);
    let top = parseInt(String(topFloor ?? '1'), 10);

    if (isNaN(base)) base = 1;
    if (isNaN(top)) top = base > 0 ? base : 1;

    const minFloor = Math.min(base, top);
    const maxFloor = Math.max(base, top);

    const floorList = [];
    for (let i = minFloor; i <= maxFloor; i++) {
      floorList.push({
        label: `${i}楼`,
        value: i.toString(),
      });
    }

    // 确保至少有 1 层
    if (floorList.length === 0) {
      floorList.push({ label: '1楼', value: '1' });
    }

    setFloors(floorList);
    return floorList;
  };

  // 加载房间数据
  const loadRooms = async (
    architectureId: string,
    floor: string,
    cachedRoomName?: string
  ) => {
    try {
      const response: any = await getRoomInfo(architectureId, floor);
      const roomList = response?.data?.room_list || response?.msg?.room_list;

      if (roomList && roomList.length > 0) {
        setRooms(roomList);

        // 如果有缓存房间名，优先选中该房间
        if (cachedRoomName) {
          const matchedRoomIdx = roomList.findIndex(
            (r: any) => r.room_name === cachedRoomName
          );
          if (matchedRoomIdx >= 0) {
            setPickerValue2([matchedRoomIdx]);
            return;
          }
        }
        setPickerValue2([0]);
      } else {
        setRooms([]);
        setPickerValue2([0]);
      }
    } catch (error) {
      setRooms([]);
      setPickerValue2([0]);
      log.error('加载房间数据失败:', error);
    }
  };

  // 初始化加载数据
  useEffect(() => {
    loadArchitectures(selectedArea);
  }, [selectedArea]);

  // 处理区域选择
  const handleAreaClick = (area: string) => {
    if (area !== selectedArea) {
      setSelectedArea(area);
    }
  };

  // 处理楼栋和楼层选择
  const handleBuildingPickerChange = (value: any) => {
    const rawArchIndex = value?.[0] ?? 0;
    const rawFloorIndex = value?.[1] ?? 0;

    const archIndex = Math.min(
      Math.max(0, rawArchIndex),
      Math.max(0, architectures.length - 1)
    );

    const selectedArch = architectures[archIndex];
    if (!selectedArch) return;

    const isArchChanged = archIndex !== pickerValue[0];

    // 如果楼栋变了，重新生成该楼栋的楼层，并将楼层索引重置为 0
    const newFloorList = generateFloors(
      selectedArch.base_floor,
      selectedArch.top_floor
    );
    const floorIndex = isArchChanged
      ? 0
      : Math.min(rawFloorIndex, Math.max(0, newFloorList.length - 1));

    setPickerValue([archIndex, floorIndex]);

    // 计算实际选中的楼层
    const selectedFloor =
      newFloorList[floorIndex]?.value ?? selectedArch.base_floor ?? '1';

    loadRooms(selectedArch.architecture_id, selectedFloor);
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
      return;
    }

    const selectedArch = architectures[archIndex];
    const selectedRoom = rooms[roomIndex];
    if (!selectedArch || !selectedRoom) return;

    const areaLabel =
      areaData.find(item => item.value === selectedArea)?.label || '';

    const selectedFloor =
      floors[floorIndex]?.value ?? selectedArch.base_floor ?? '1';

    const archName = selectedArch.architecture_name;
    const buildingName = archName.startsWith(areaLabel)
      ? archName
      : `${areaLabel}${archName}`;

    const dormInfo = {
      area: selectedArea,
      building: buildingName,
      architecture_id: selectedArch.architecture_id,
      floor: selectedFloor,
      room: selectedRoom.room_name,
      room_id:
        selectedRoom.light || selectedRoom.ac || selectedRoom.union || '',
      ac: selectedRoom.ac,
      light: selectedRoom.light,
      union: selectedRoom.union,
    };

    // 保存选择的宿舍信息
    setSelectedDorm(dormInfo);

    router.replace({
      pathname: '/electricityBalance',
      params: {
        building: dormInfo.building,
        room: dormInfo.room,
        area: dormInfo.area,
        room_id: dormInfo.room_id,
        ac: dormInfo.ac,
        light: dormInfo.light,
        union: dormInfo.union,
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
            style={{ width: 16, height: 16 }}
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
            style={{ width: 16, height: 16 }}
            source={require('../../assets/images/building.png')}
          />
        </View>
        <View style={{ paddingTop: 8, paddingBottom: 34 }}>
          {loading ? (
            <Text style={styles.loadingText}>加载中...</Text>
          ) : architectures.length > 0 && floors.length > 0 ? (
            <PickerView
              data={buildingColumns}
              value={pickerValue}
              cascade={false}
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
            style={{ width: 16, height: 16 }}
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

export default ElectricityInquiry;

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
    minWidth: 61,
    height: 65,
    paddingHorizontal: 8,
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
