import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import RegionIcon from '@/assets/icons/library/region.svg';
import useVisualScheme from '@/store/visualScheme';
import { commonStyles } from '@/styles/common';

const regions = {
  Main: {
    F1: ['主馆一楼综合学习室'],
    F2: ['主馆二楼借阅室（一）', '主馆二楼借阅室（二）'],
    F3: ['主馆三楼借阅室（三）'],
    F5: ['主馆五楼借阅室（四）', '主馆五楼借阅室（五）'],
    F6: ['主馆六楼阅览室（一）', '主馆六楼外文借阅室'],
    F7: ['主馆七楼阅览室（二）', '主馆七楼阅览室（三）'],
    F9: ['主馆九楼阅览室'],
  },
  Lake: {
    F1: ['南湖分馆一楼开敞座位区', '南湖分馆一楼中庭开敞座位区'],
    F2: ['南湖分馆二楼开敞座位区', '南湖分馆二楼卡座区'],
  },
};

export interface SelectRegionProps {
  selectedRegion?: string | null;
  setSelectedRegion: (text: string) => void;
}
export default function SelectRegion({
  selectedRegion,
  setSelectedRegion,
}: SelectRegionProps) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null); // 当前展开的一级菜单
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const handleSelect = (text: string) => {
    setSelectedRegion(text);
    setVisible(false);
    setExpanded(null);
  };

  return (
    <>
      {/* 选择按钮 */}
      <TouchableOpacity
        style={{
          width: '100%',
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
        }}
        onPress={() => setVisible(true)}
      >
        <View
          style={{
            borderWidth: 1,
            borderRadius: 12,
            borderColor: '#D4B8FE',
            flexDirection: 'row',
            flex: 1,
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RegionIcon style={{ position: 'absolute', left: 20 }} />
          <Text style={[commonStyles.fontMedium, currentStyle?.text_style]}>
            {selectedRegion !== null ? `已选择：${selectedRegion}` : '选择区域'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 下拉菜单 */}
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}
          activeOpacity={1}
        >
          <View style={[styles.menuContainer, currentStyle?.background_style]}>
            <ScrollView>
              {Object.entries(regions).map(([library, floors]) => (
                <View key={library}>
                  <Text style={[styles.libraryTitle, currentStyle?.text_style]}>
                    {library === 'Main' ? '主图书馆' : '南湖分馆'}
                  </Text>
                  {Object.entries(floors).map(([floor, rooms]) => (
                    <View key={floor}>
                      {/* 一级菜单 */}
                      <TouchableOpacity
                        style={[
                          styles.floorItem,
                          currentStyle?.header_background_style,
                        ]}
                        onPress={() =>
                          setExpanded(
                            expanded === `${library}_${floor}`
                              ? null
                              : `${library}_${floor}`
                          )
                        }
                      >
                        <Text style={currentStyle?.text_style}>{floor}</Text>
                      </TouchableOpacity>

                      {/* 二级菜单 */}
                      {expanded === `${library}_${floor}` && (
                        <View
                          style={[
                            styles.subMenu,
                            currentStyle?.background_style,
                          ]}
                        >
                          {rooms.map((room, i) => (
                            <TouchableOpacity
                              key={i}
                              style={[
                                styles.subItem,
                                currentStyle?.header_background_style,
                              ]}
                              onPress={() => handleSelect(room)}
                            >
                              <Text style={currentStyle?.text_style}>
                                {room}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  libraryTitle: {
    fontWeight: 'bold',
    marginVertical: 6,
  },
  floorItem: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 4,
  },
  subMenu: {
    marginLeft: 16,
  },
  subItem: {
    padding: 6,
    backgroundColor: '#e6e6ff',
    borderRadius: 6,
    marginVertical: 2,
  },
});
