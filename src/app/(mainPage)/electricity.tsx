import { router } from 'expo-router';
import { useEffect } from 'react';

import { useElectricityStore } from '@/store/electricity';

export default function Electricity() {
  const selectedDorm = useElectricityStore(state => state.selectedDorm);

  useEffect(() => {
    if (selectedDorm) {
      // 如果已经选择过宿舍，直接跳转到电费查询页面
      router.push({
        pathname: '/electricityBillinBalance',
        params: {
          building: selectedDorm.building,
          room: selectedDorm.room,
          area: selectedDorm.area,
          room_id: selectedDorm.room_id,
        },
      });
    } else {
      // 如果没有选择过宿舍，跳转到选择宿舍页面
      router.push('/electricityBillinQuiry');
    }
  }, [selectedDorm]);

  // 由于会立即跳转，这里返回 null
  return null;
}
