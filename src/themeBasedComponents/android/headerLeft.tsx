import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import * as React from 'react';
import { TextStyle, TouchableOpacity } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import { commonStyles } from '@/styles/common';

import { MainPageGridDataType } from '@/types/mainPageGridTypes';

const HeaderLeft: React.FC<{ config?: MainPageGridDataType }> = () => {
  const pathname = usePathname();
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const handleBack=()=>{
     if(pathname.endsWith('electricityBillinBalance')){
      router.replace('/')
     }else{
      router.back()
     }
  }
  return (
    <TouchableOpacity onPress={handleBack}>
      <Ionicons
        name="arrow-back-outline"
        size={commonStyles.fontLarge.fontSize}
        color={(currentStyle?.text_style as TextStyle).color}
      />
    </TouchableOpacity>
  );
};

export default HeaderLeft;