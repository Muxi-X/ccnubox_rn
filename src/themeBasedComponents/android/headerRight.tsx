import { router, usePathname } from 'expo-router';
import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

type HeaderRightProps = {
  title: string;
  target?: string;
  mainPagePath?: string;
};

const HeaderRight: React.FC<HeaderRightProps> = ({
  title,
  target,
  mainPagePath,
}) => {
  const pathname = usePathname();
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle
  }))

  if (!mainPagePath || pathname !== mainPagePath) {
    return null;
  }

  const handleBack = () => {
    if (target) {
      router.push(target as any);
    } 
  };

  return (
    <View>
      <TouchableOpacity onPress={handleBack}>
        <Text
          style={[
            currentStyle?.text_style
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HeaderRight;
