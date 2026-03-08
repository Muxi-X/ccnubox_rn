import { FlatList } from 'react-native';

import ThemeBasedView from '@/components/view';

import { SETTING_ITEMS } from '@/constants/SETTING';

import PushSubscriptionItem from './components/pushSubscriptionItem';
import SettingItem from './components/settingItem';

export default function SettingPage() {
  return (
    <ThemeBasedView style={{ flex: 1 }}>
      <PushSubscriptionItem />
      <FlatList
        data={SETTING_ITEMS}
        renderItem={({ item }) => <SettingItem {...item} />}
        keyExtractor={item => item.id.toString()}
      />
    </ThemeBasedView>
  );
}
