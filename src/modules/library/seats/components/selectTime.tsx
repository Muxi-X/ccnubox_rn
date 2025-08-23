import { Text, TouchableOpacity, View } from 'react-native';

import DateIcon from '@/assets/icons/library/date.svg';
import TimeIcon from '@/assets/icons/library/time.svg';
import { commonStyles } from '@/styles/common';

export default function SelectTime() {
  return (
    <View
      style={{
        padding: 4,
        height: 50,
      }}
    >
      <View
        style={{
          height: '100%',
          width: '100%',
          borderWidth: 1,
          borderRadius: 12,
          borderColor: '#D4B8FE',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
          }}
        >
          <DateIcon />
          <Text style={commonStyles.fontMedium}>2024年1月15日</Text>
        </TouchableOpacity>
        <View style={{ width: 1, height: '70%', backgroundColor: '#D4B8FE' }} />
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TimeIcon style={{ position: 'absolute', left: 20 }} />
          <Text style={commonStyles.fontMedium}>09:00-12:00</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
