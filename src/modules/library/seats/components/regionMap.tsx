import { Text, View } from 'react-native';

import { ModalTrigger } from '@/components/modal';

import AppointedIcon from '@/assets/icons/library/appointed.svg';
import FreeIcon from '@/assets/icons/library/free.svg';
import HalfFreeIcon from '@/assets/icons/library/halffree.svg';
import OccupiedIcon from '@/assets/icons/library/occupied.svg';
import QuestionIcon from '@/assets/icons/library/question.svg';
import UnavailableIcon from '@/assets/icons/library/unavailable.svg';

export default function RegionMap() {
  return (
    <View style={{ height: '100%', width: '100%' }}>
      <View
        style={{
          padding: 4,
          height: 250,
          backgroundColor: '#F5F5F5',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Map</Text>
      </View>
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
