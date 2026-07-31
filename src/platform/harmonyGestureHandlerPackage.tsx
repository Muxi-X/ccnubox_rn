import { Gesture, GestureDetector } from './harmonyGestureHandler';
import * as GestureHandler from '@react-native-oh-tpl/react-native-gesture-handler';

export * from '@react-native-oh-tpl/react-native-gesture-handler';
export { Gesture, GestureDetector } from './harmonyGestureHandler';

export default {
  ...GestureHandler,
  Gesture,
  GestureDetector,
};
