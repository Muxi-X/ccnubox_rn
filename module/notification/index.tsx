import { getItem } from 'expo-secure-store';
import React, { FC, memo, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import Skeleton from '@/components/skeleton';

import useVisualScheme from '@/store/visualScheme';

const NotificationPage: FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const currentStyles = useVisualScheme(state => state.currentStyle);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);
  return (
    <View style={[{ flex: 1 }, currentStyles?.background_style]}>
      <Skeleton loading={loading}>
        <Text style={currentStyles?.text_style}>
          token: {getItem('pushToken')}
        </Text>
      </Skeleton>
    </View>
  );
};

export default memo(NotificationPage);
