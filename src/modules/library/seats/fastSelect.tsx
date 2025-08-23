import { View } from 'react-native';

import SelectRegion from './components/selectRegion';
import SelectTime from './components/selectTime';

export default function FastSelect() {
  return (
    <View>
      <SelectRegion />
      <SelectTime />
    </View>
  );
}
