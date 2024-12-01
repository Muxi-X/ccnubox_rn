import { FlatList } from 'react-native';

import ThemeBasedView from '@/components/view';

import { SettingItems } from '@/constants/settingItem';
import SettingItem from '@/module/setting/components/settingItem';

export default function SettingPage() {
  return (
    <ThemeBasedView style={{ flex: 1 }}>
      <FlatList
        data={SettingItems}
        renderItem={({ item }) => <SettingItem {...item} />}
        keyExtractor={item => item.id.toString()}
      />
    </ThemeBasedView>
  );
}