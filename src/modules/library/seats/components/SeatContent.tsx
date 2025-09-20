import { View } from 'react-native';
import Seat from './seat';
export const SeatContent = () => (
  <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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
          />
        ))}
      </View>
    </View>
  </View>
);
