import { AboutSeatCard } from '@/modules/library/seats/components/aboutSeatCard';
import { useState } from 'react';
import { ScrollView } from 'react-native';
interface favouriteSeatProps {
  seatID: number;
  position: string;
  seatNumber: string;
}
export default function myFavourites() {
  const [favouriteSeats, setFavouriteSeats] = useState<favouriteSeatProps[]>([
    {
      seatID: 1,
      position: '本部图书馆-二楼借阅室',
      seatNumber: '222',
    },
  ]);

  return (
    <ScrollView>
      {favouriteSeats.map(item => {
        return (
          <AboutSeatCard
            key={item.seatID}
            title={item.position}
            seatNumber={item.seatNumber}
            favouriteDisplay={true}
          ></AboutSeatCard>
        );
      })}
    </ScrollView>
  );
}
