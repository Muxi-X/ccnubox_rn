import { NativeModules } from 'react-native';

import Button from '@/components/button';
export default function All() {
  const AndoridBridge = NativeModules.AndoridBridge;
  return (
    <Button
      onPress={() => {
        AndoridBridge.updateCourseData('测试测试');
      }}
    >
      222
    </Button>
  );
}
