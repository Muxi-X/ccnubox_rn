import { Text, TouchableOpacity, View } from 'react-native';

import RegionIcon from '@/assets/icons/library/region.svg';
import { commonStyles } from '@/styles/common';

export default function SelectRegion() {
  return (
    <TouchableOpacity
      style={{
        width: '100%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
      }}
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
        <Text style={commonStyles.fontMedium}>选择区域</Text>
        <View></View>
      </View>
    </TouchableOpacity>
  );
}
