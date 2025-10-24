import { PickerView as AntdPickerView } from '@ant-design/react-native';
import { PickerViewProps } from '@ant-design/react-native/es/picker-view';
import { PickerViewStyle } from '@ant-design/react-native/es/picker-view/style';
import { FC } from 'react';

import useVisualScheme from '@/store/visualScheme';
import { red } from 'react-native-reanimated/lib/typescript/Colors';
/**
 * 封装的 PickerView 组件，适配项目主题配色
 */
const PickerView: FC<PickerViewProps> = ({ styles: propStyles, ...props }) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  const styles: Partial<PickerViewStyle> = {
    maskMiddle: {
      borderRadius: 10,
      backgroundColor: currentStyle?.background_style?.backgroundColor,
      opacity: 0.2,
      zIndex: -1,
    },
    wrappper: {
      backgroundColor: currentStyle?.background_style?.backgroundColor,
    },
    // mask:{
    //   backgroundColor: currentStyle?.background_style?.backgroundColor,
    //   opacity:0.1,
    // },
    maskBottom: {
      backgroundColor: '#000000',
      opacity: 0.2,
    },
    maskTop: {
      backgroundColor: '#000000',
      opacity: 0.2,
    },
    itemStyle: {
      color: currentStyle?.picker_active_text_style?.color,
      backgroundColor: currentStyle?.background_style?.backgroundColor,
    },
  };

  return (
    <>
      <AntdPickerView
        styles={{ ...styles, ...propStyles }}
        {...props}
      ></AntdPickerView>
    </>
  );
};

export default PickerView;
