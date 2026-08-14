import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ThemeBasedView from '@/components/view';
import { SETTING_ITEMS } from '@/constants/SETTING';
import { TABBAR_BASE_HEIGHT } from '@/constants/TABBAR';

import PushSubscriptionItem from './components/pushSubscriptionItem';
import SettingItem from './components/settingItem';

export default function SettingPage() {
  const insets = useSafeAreaInsets();
  const tabbarHeight = TABBAR_BASE_HEIGHT + insets.bottom;

  return (
    <ThemeBasedView style={{ flex: 1 }}>
      <PushSubscriptionItem />
      <FlatList
        data={SETTING_ITEMS}
        renderItem={({ item }) => <SettingItem {...item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: tabbarHeight + 10 }}
      />
    </ThemeBasedView>
  );
}
