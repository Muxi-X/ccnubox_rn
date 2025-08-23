import { Text, View } from 'react-native';

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
        <View style={{ alignItems: 'center', gap: 10 }}>
          <QuestionIcon />
        </View>
      </View>
    </View>
  );
}
