export interface SliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange?: (value: number) => void;
  onSlidingStart?: () => void;
  onSlidingComplete?: () => void;
  thumbStyle?: any;
  style?: any;
  minimumTrackTintColor?: string;
}
