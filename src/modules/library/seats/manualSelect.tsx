import { View } from 'react-native';

import RegionMap from './components/regionMap';
import SelectRegion from './components/selectRegion';
import SelectTime from './components/selectTime';

export default function ManualSelect() {
  return (
    <View>
      <SelectRegion />
      <SelectTime />
      <RegionMap />
    </View>
  );
}
