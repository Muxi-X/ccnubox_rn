import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { TextStyle, TouchableOpacity } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import { commonStyles } from '@/styles/common';

import { MainPageGridDataType } from '@/types/mainPageGridTypes';

export const HeaderLeft: React.FC<{ config: MainPageGridDataType }> = ({
  config,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <TouchableOpacity onPress={router.back}>
      <Ionicons
        name="arrow-back-outline"
        size={commonStyles.fontLarge.fontSize}
        color={(currentStyle?.text_style as TextStyle).color}
      />
    </TouchableOpacity>
  );
};
export default HeaderLeft;
