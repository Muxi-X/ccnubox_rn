import { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { PreLoginCard } from '@/module/guide/components/preloginCard';

const GuidePage: FC = () => {
  return (
    <View style={styles.guide_wrap}>
      <PreLoginCard />
      <View></View>
    </View>
  );
};

export default GuidePage;
export const styles = StyleSheet.create({
  guide_wrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
