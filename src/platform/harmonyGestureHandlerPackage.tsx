import { Gesture, GestureDetector } from './harmonyGestureHandler';
import * as GestureHandler from '../../node_modules/react-native-gesture-handler';

export * from '../../node_modules/react-native-gesture-handler';
export { Gesture, GestureDetector } from './harmonyGestureHandler';

export default {
  ...GestureHandler,
  Gesture,
  GestureDetector,
};
