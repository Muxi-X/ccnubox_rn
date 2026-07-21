import { FC } from 'react';
import { StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import { Button as RNEButton } from 'react-native-elements';

import { ButtonProps } from '@/components/button/type';
import useVisualScheme from '@/store/visualScheme';
import { commonColors } from '@/styles/common';

const Button: FC<ButtonProps> = ({
  isLoading = false,
  onPress,
  text_style,
  style,
  children,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const btnGlobalStyle = currentStyle?.button_style ?? {};
  const textGlobalStyle = currentStyle?.button_text_style ?? {};
  const ripplePurple = commonColors.lightPurple ?? '#B8A6F5';

  return (
    <TouchableNativeFeedback
      background={TouchableNativeFeedback.Ripple(ripplePurple, false)}
      disabled={isLoading}
      onPress={() => onPress?.(true)}
    >
      <View
        style={[styles.rect_button, { opacity: isLoading ? 0.4 : 1 }, style]}
      >
        <RNEButton
          activeOpacity={1}
          containerStyle={[btnGlobalStyle]}
          buttonStyle={styles.button}
          titleStyle={[textGlobalStyle, text_style]}
          loading={isLoading}
          loadingProps={{ color: '#fff', style: { marginRight: 5 } }}
          title={children}
          accessibilityRole="button"
        />
      </View>
    </TouchableNativeFeedback>
  );
};

const styles = StyleSheet.create({
  rect_button: {
    width: 200,
    height: 40,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
});

export default Button;
