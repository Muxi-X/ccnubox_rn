import { useRouter } from 'expo-router';
import { deleteItemAsync } from 'expo-secure-store';

import View from '@/components/view';

function Exit() {
  const router = useRouter();
  deleteItemAsync('longToken').then(() => {
    router.replace('/auth/login');
  });
  // 待优化点
  return <View></View>;
}
export default Exit;
