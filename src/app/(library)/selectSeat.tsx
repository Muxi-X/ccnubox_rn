import { View } from 'react-native';

import TabBar from '@/components/tabs';

import FastSelect from '@/modules/library/seats/fastSelect';
import ManualSelect from '@/modules/library/seats/manualSelect';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function ViewSeats() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TabBar tabs={[{ title: '普通选座' }, { title: '快速选座' }]}>
          <View style={{ flex: 1 }}>
            <ManualSelect />
          </View>
          <View style={{ flex: 1 }}>
            <FastSelect />
          </View>
        </TabBar>
      </View>
    </GestureHandlerRootView>
  );
}
