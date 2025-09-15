import { JSX, useEffect, useRef } from 'react';
import { Animated, ScrollView, Text, View } from 'react-native';

import { ModalTrigger } from '@/components/modal';

import AppointedIcon from '@/assets/icons/library/appointed.svg';
import FreeIcon from '@/assets/icons/library/free.svg';
import HalfFreeIcon from '@/assets/icons/library/halffree.svg';
import OccupiedIcon from '@/assets/icons/library/occupied.svg';
import QuestionIcon from '@/assets/icons/library/question.svg';
import UnavailableIcon from '@/assets/icons/library/unavailable.svg';

import Seat from './seat';

import {
  LakeF1Atrium,
  LakeF1Open,
  LakeF2Open,
  LakeF2Seats,
  MainF1Room,
  MainF2Room1,
  MainF2Room2,
  MainF3Room,
  MainF5Room4,
  MainF5Room5,
  MainF6ForeignRoom,
  MainF6Room1,
  MainF7Room2,
  MainF7Room3,
  MainF9Room,
} from './regionComponents';

export const regionComponents: Record<string, JSX.Element> = {
  主馆一楼综合学习室: <MainF1Room />,
  '主馆二楼借阅室（一）': <MainF2Room1 />,
  '主馆二楼借阅室（二）': <MainF2Room2 />,
  '主馆三楼借阅室（三）': <MainF3Room />,
  '主馆五楼借阅室（四）': <MainF5Room4 />,
  '主馆五楼借阅室（五）': <MainF5Room5 />,
  '主馆六楼阅览室（一）': <MainF6Room1 />,
  主馆六楼外文借阅室: <MainF6ForeignRoom />,
  '主馆七楼阅览室（二）': <MainF7Room2 />,
  '主馆七楼阅览室（三）': <MainF7Room3 />,
  主馆九楼阅览室: <MainF9Room />,
  南湖分馆一楼开敞座位区: <LakeF1Open />,
  南湖分馆一楼中庭开敞座位区: <LakeF1Atrium />,
  南湖分馆二楼开敞座位区: <LakeF2Open />,
  南湖分馆二楼卡座区: <LakeF2Seats />,
};

export interface RegionMapProps {
  selectedRegion: string | null;
}

export default function RegionMap({ selectedRegion }: RegionMapProps) {
  //这个文件夹下是个人选座的小组件，用于seats文件夹下大组件的开发
  const headerHeight = useRef(new Animated.Value(250)).current;

  useEffect(() => {
    Animated.timing(headerHeight, {
      toValue: selectedRegion ? 150 : 250,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selectedRegion]); //这个地方的selectedRegion是从父组件传过来的，emmm依赖项后面要改一下，改成点击图片上的区域按钮来弹出这个弹窗。

  return (
    <View style={{ height: '100%', width: '100%' }}>
      <Animated.View
        style={{
          padding: 4,
          height: headerHeight,
          backgroundColor: '#F5F5F5',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selectedRegion ? (
          regionComponents['主馆一楼综合学习室']
        ) : (
          <Text>请先选择一个区域</Text>
        )}
      </Animated.View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          padding: 10,
        }}
      >
        <View style={{ alignItems: 'center', gap: 10 }}>
          <FreeIcon />
          <Text>空闲</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <HalfFreeIcon />
          <Text>半空闲</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <OccupiedIcon />
          <Text>忙碌</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <AppointedIcon />
          <Text>已预约</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <UnavailableIcon />
          <Text>不开放</Text>
        </View>
        <ModalTrigger
          style={{ alignItems: 'center', gap: 10 }}
          mode="middle"
          triggerComponent={<QuestionIcon />}
        >
          <QuestionContent />
        </ModalTrigger>
      </View>
      {selectedRegion && (
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 8,
            justifyContent: 'space-evenly',
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}
        >
          {/* two columns */}
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            {/* left column */}
            <View
              style={{
                gap: 30,
                paddingVertical: 18,
                width: '50%',
                alignItems: 'center',
              }}
            >
              {Array.from({ length: 12 }).map((_, idx) => (
                <View key={idx} style={{ flexDirection: 'row' }}>
                  <Seat seatStatus={0b00000} />
                  <Seat seatStatus={0b10000} />
                  <Seat seatStatus={0b11111} />
                  <Seat seatStatus={0b01111} />
                  <Seat seatStatus={0b00011} />
                  <Seat seatStatus={0b01100} />
                </View>
              ))}
            </View>
            {/* right column */}
            <View
              style={{
                gap: 30,
                paddingVertical: 18,
                width: '50%',
                alignItems: 'center',
              }}
            >
              {Array.from({ length: 12 }).map((_, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    backgroundColor: '#aaaaaa',
                    width: 56,
                    height: 42,
                  }}
                ></View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const QuestionContent = () => {
  return (
    <View style={{ width: '100%' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
        常见疑问
      </Text>
      <View style={{ marginTop: 16, gap: 4 }}>
        <Text style={{ fontSize: 16, lineHeight: 24 }}>
          若我预约了
          <Text style={{ color: '#7B71F1', fontWeight: '600' }}>
            8:00-12:00
          </Text>
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 24 }}>
          但我选中的座位只有在
          <Text style={{ color: '#7B71F1', fontWeight: '600' }}>8:00-9:00</Text>
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 24 }}>
          以及
          <Text style={{ color: '#7B71F1', fontWeight: '600' }}>
            10:00-11:00
          </Text>
          有空，则显示：
        </Text>
      </View>

      <View
        style={{
          marginTop: 18,
          alignSelf: 'center',
          width: 300,
          aspectRatio: 300 / 220,
          marginBottom: 16,
        }}
      >
        {/* 2 x 2 grid */}
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#F4C338',
              height: 110,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900' }}>
              4
            </Text>
            <Text style={{ color: '#fff', marginTop: 4 }}>11:00-12:00</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#52C27F',
              height: 110,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900' }}>
              1
            </Text>
            <Text style={{ color: '#fff', marginTop: 4 }}>8:00-9:00</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#52C27F',
              height: 110,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900' }}>
              3
            </Text>
            <Text style={{ color: '#fff', marginTop: 4 }}>10:00-11:00</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#F4C338',
              height: 110,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900' }}>
              2
            </Text>
            <Text style={{ color: '#fff', marginTop: 4 }}>9:00-10:00</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
