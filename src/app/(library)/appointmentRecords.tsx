import { RecordCard } from '@/modules/library/seats/components/recordCard';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
interface appointmentSeatProps {
  ID: number;
  title: string;
  status: 0 | 1 | 2; //这里的作用是根据数字确定预约记录的状态。0表示已结束，1表示进行中，2表示违约。
  appointmentTime: string;
  position: string;
  seatNumber: string;
  checkIn: string;
  checkOut: string;
  defaultReason?: string;
}
export default function appointmentRecords() {
  const [appointmentSeats, setAppointmentSeats] = useState<
    appointmentSeatProps[]
  >([
    {
      ID: 1,
      title: '2024年1月24日 星期四',
      status: 0,
      appointmentTime: '08:00-10:00',
      position: '本部图书馆-二楼借阅室',
      seatNumber: '222',
      checkIn: '08:05',
      checkOut: '10:00',
    },
    {
      ID: 2,
      title: '2024年1月24日 星期四',
      status: 1,
      appointmentTime: '08:00-10:00',
      position: '本部图书馆-二楼借阅室',
      seatNumber: '222',
      checkIn: '08:05',
      checkOut: '10:00',
    },
    {
      ID: 3,
      title: '2024年1月24日 星期四',
      status: 2,
      appointmentTime: '08:00-10:00',
      position: '本部图书馆-二楼借阅室',
      seatNumber: '222',
      checkIn: '08:05',
      checkOut: '10:00',
      defaultReason: '未按时签到',
    },
  ]);

  return (
    <ScrollView>
      <View style={{ display: 'flex', alignItems: 'center' }}>
        {appointmentSeats.map(item => {
          return (
            <RecordCard
              key={item.ID}
              title={item.title}
              status={item.status}
              seatNumber={item.seatNumber}
              appointmentTime={item.appointmentTime}
              position={item.position}
              checkIn={item.checkIn}
              checkOut={item.checkOut}
              defaultReason={item.defaultReason}
            ></RecordCard>
          );
        })}
      </View>
    </ScrollView>
  );
}
