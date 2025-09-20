import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';

import FavoriteIcon from '@/assets/icons/library/favorite.svg';
import HistoryIcon from '@/assets/icons/library/history.svg';
import RandomIcon from '@/assets/icons/library/random.svg';

import SelectRegion from './components/selectRegion';
import SelectTime from './components/selectTime';

//大组件
export default function FastSelect() {
  const favoriteSeats: string[] = [
    'A区 k1',
    'A区 k2',
    'A区 k3',
    'B区 k33',
    'C区 k90',
  ];
  const historySeats: string[] = ['A区 k1', 'A区 k2', 'A区 k3'];

  const renderChip = (
    label: string,
    variant: 'default' | 'disabled' = 'default'
  ) => {
    const baseStyles = {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: variant === 'disabled' ? '#E5E5EA' : '#F2EFFF',
    } as const;
    return (
      <View key={label} style={baseStyles}>
        <Text style={{ fontSize: 14 }}>{label}</Text>
      </View>
    );
  };

  return (
    <View>
      <SelectRegion
        setSelectedRegion={() => {
          return null;
        }}
      />
      {/* //这个组件被我改成要传props的了所以传了个空函数 */}
      <SelectTime />
      <TouchableOpacity style={{ padding: 12 }}>
        <LinearGradient
          colors={['#7B6EF1', '#9E77F8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            paddingVertical: 20,
            paddingHorizontal: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <RandomIcon color="#fff" />
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff' }}>
              随机选座
            </Text>
          </View>
          <Text style={{ color: '#EFE9FF', marginTop: 8 }}>
            系统将根据筛选条件随机分配座位
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={{ paddingHorizontal: 12 }}>
        <View
          style={{
            borderWidth: 2,
            borderColor: '#A984F9',
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 16,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <FavoriteIcon />
            <Text style={{ fontSize: 22, fontWeight: '900' }}>收藏座位</Text>
          </View>
          <Text style={{ color: '#929292' }}>
            已收藏5个座位，当前时段可用3个
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {favoriteSeats.map((s, idx) =>
              renderChip(
                s,
                idx === favoriteSeats.length - 1 ? 'disabled' : 'default'
              )
            )}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 12 }}>
        <View
          style={{
            borderWidth: 2,
            borderColor: '#A984F9',
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 16,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <HistoryIcon />
            <Text style={{ fontSize: 22, fontWeight: '900' }}>历史预约</Text>
          </View>
          <Text style={{ color: '#929292' }}>
            最近预约3个座位，当前时段可用3个
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {historySeats.map(s => renderChip(s))}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
