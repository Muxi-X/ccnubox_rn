import AppointedIcon from '@/assets/icons/library/appointed.svg';
import FreeIcon from '@/assets/icons/library/free.svg';
import HalfFreeIcon from '@/assets/icons/library/halffree.svg';
import OccupiedIcon from '@/assets/icons/library/occupied.svg';
import QuarterFreeIcon from '@/assets/icons/library/quarterfree.svg';
import UnavailableIcon from '@/assets/icons/library/unavailable.svg';

// 状态码，第一位表示是否可用，后四位表示可用时段
type SeatStatus =
  | 0b10000 // 不开放
  | 0b11111 // 已预约
  | 0b00000 // 空闲
  | 0b00001
  | 0b00010
  | 0b00011
  | 0b00100
  | 0b00101
  | 0b00110
  | 0b00111
  | 0b01000
  | 0b01001
  | 0b01010
  | 0b01011
  | 0b01100
  | 0b01101
  | 0b01110
  | 0b01111; // 忙碌

export default function Seat({ seatStatus }: { seatStatus: SeatStatus }) {
  switch (seatStatus) {
    case 0b11111:
      return <AppointedIcon />;
    case 0b01111:
      return <OccupiedIcon />;
    case 0b00000:
      return <FreeIcon />;
    case 0b00011:
      return <HalfFreeIcon style={{ transform: [{ rotate: '180deg' }] }} />;
    case 0b01100:
      return <HalfFreeIcon />;
    case 0b00001:
      return <QuarterFreeIcon></QuarterFreeIcon>;
    case 0b10000:
    default:
      return <UnavailableIcon />;
  }
}
