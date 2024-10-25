import { getItem } from 'expo-secure-store';
import React, { FC, memo, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import Skeleton from '@/components/skeleton';

const NotificationPage: FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <Skeleton loading={loading}>
        <Text>token: {getItem('pushToken')}</Text>
      </Skeleton>
    </View>
  );
};

export default memo(NotificationPage);
